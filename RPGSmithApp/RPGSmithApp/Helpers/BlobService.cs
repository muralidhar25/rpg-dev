using DAL.Models.APIModels;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Linq;
using System.Reflection;
using DAL.Models;
using DAL.Core.Interfaces;

namespace RPGSmithApp.Helpers
{
    public class BlobService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAccountManager _accountManager;
        const string StorageFullMessage = "Your account storage space is full. Please buy more space to upload more files.";
      
        public BlobService(IHttpContextAccessor httpContextAccessor, IAccountManager accountManager) {
            _httpContextAccessor = httpContextAccessor;
            _accountManager = accountManager;
        }
        public async Task<CloudBlobContainer> GetCloudBlobContainer(string containerName = "media")
        {
            CloudStorageAccount cloudStorageAccount = CloudStorageAccount.Parse("DefaultEndpointsProtocol=https;AccountName=rpgsmithsa;AccountKey=aW0FB0jHDNqCMwNYowsKxjlBwqs+3WxUcTG5sAdr29vrCO/4c8FA+3603WQ1PuHEAj5+MAq4cHC62tbiG9bmCA==;EndpointSuffix=core.windows.net");

            CloudBlobClient cloudBlobClient = cloudStorageAccount.CreateCloudBlobClient();
            CloudBlobContainer cloudBlobContainer = cloudBlobClient.GetContainerReference(containerName);

            //if(await cloudBlobContainer.ExistsAsync())
                       
            if (await cloudBlobContainer.CreateIfNotExistsAsync())
            {
                await cloudBlobContainer.SetPermissionsAsync(
                    new BlobContainerPermissions
                    {
                        PublicAccess = BlobContainerPublicAccessType.Blob
                    });

                // Add some metadata to the container.
                await AddContainerMetadataAsync(cloudBlobContainer);
            }
            return cloudBlobContainer;
        }

        public async Task AddContainerMetadataAsync(CloudBlobContainer container)
        {
            try
            {
                // Add some metadata to the container.
                container.Metadata.Add("app", "rpgsmith");
                //container.Metadata["app"] = "rpgsmith";

                // Set the container's metadata.
                await container.SetMetadataAsync();
            }
            catch { }
        }

        public async Task<bool> DeleteBlobContainer(string containerName)
        {
            CloudStorageAccount cloudStorageAccount = CloudStorageAccount.Parse("DefaultEndpointsProtocol=https;AccountName=rpgsmithsa;AccountKey=aW0FB0jHDNqCMwNYowsKxjlBwqs+3WxUcTG5sAdr29vrCO/4c8FA+3603WQ1PuHEAj5+MAq4cHC62tbiG9bmCA==;EndpointSuffix=core.windows.net");

            CloudBlobClient cloudBlobClient = cloudStorageAccount.CreateCloudBlobClient();
            CloudBlobContainer cloudBlobContainer = cloudBlobClient.GetContainerReference(containerName);

            return await cloudBlobContainer.DeleteIfExistsAsync();
        }

        public async Task<string> UploadImages(IFormFile httpPostedFile, string fileName, CloudBlobContainer cloudBlobContainer)
        {
            if (!doesUserHaveEnoughSpace(cloudBlobContainer.Name))
            {
                throw new System.InvalidOperationException(StorageFullMessage);
            }
            CloudBlockBlob cloudBlockBlob = cloudBlobContainer.GetBlockBlobReference(fileName + "" + Path.GetExtension(httpPostedFile.FileName));
            using (System.Drawing.Image img = System.Drawing.Image.FromStream(httpPostedFile.OpenReadStream()))
            {
                Stream ms = new MemoryStream(Utilities.ToByteArray(Utilities.Resize(img, 640, 640)));
                FileStreamResult res = new FileStreamResult(ms, httpPostedFile.ContentType);
                cloudBlockBlob.Properties.ContentType = res.ContentType;
                await cloudBlockBlob.UploadFromStreamAsync(ms);
            }


            return cloudBlockBlob.Uri.ToString();
        }
        public async Task<string> Uploadvideos(IFormFile httpPostedFile, string fileName, CloudBlobContainer cloudBlobContainer)
        {
            if (!doesUserHaveEnoughSpace(cloudBlobContainer.Name))
            {
                throw new System.InvalidOperationException(StorageFullMessage);
            }
            CloudBlockBlob cloudBlockBlob = cloudBlobContainer.GetBlockBlobReference(fileName + "" + Path.GetExtension(httpPostedFile.FileName));

            //HttpWebRequest request;
            //request.Method = "PUT";
            //using (Stream requestStream = request.GetRequestStream())
            //using (Stream video = File.OpenRead("Path"))
            //{
            //    byte[] buffer = new byte[4096];

            //    while (true)
            //    {
            //        int bytesRead = video.Read(buffer, 0, buffer.Length);

            //        if (bytesRead == 0) break;
            //        requestStream.Write(buffer, 0, bytesRead);
            //    }
            //}
            using (var ms1 = new MemoryStream())
            {
                httpPostedFile.CopyTo(ms1);
                var fileBytes = ms1.ToArray();
                Stream ms = new MemoryStream(fileBytes);
                FileStreamResult res = new FileStreamResult(ms, httpPostedFile.ContentType);
                cloudBlockBlob.Properties.ContentType = res.ContentType;
                await cloudBlockBlob.UploadFromStreamAsync(ms);
                return cloudBlockBlob.Uri.ToString();
            }
           // Stream ms = new MemoryStream();
           // httpPostedFile.CopyTo(ms);  
        }

        public async Task<string> UploadThumbnail(IFormFile httpPostedFile, string fileName, CloudBlobContainer cloudBlobContainer)
        {
            if (!doesUserHaveEnoughSpace(cloudBlobContainer.Name))
            {
                throw new System.InvalidOperationException(StorageFullMessage);
            }
            Image myThumbnail150;
            Image.GetThumbnailImageAbort myCallback = new Image.GetThumbnailImageAbort(ThumbnailCallback);
            Image imagesize = Image.FromStream(httpPostedFile.OpenReadStream());
            Bitmap bitmapNew = new Bitmap(imagesize);
            if (imagesize.Width < imagesize.Height)
            {
                myThumbnail150 = bitmapNew.GetThumbnailImage(150 * imagesize.Width / imagesize.Height, 150, myCallback, IntPtr.Zero);
            }
            else
            {
                myThumbnail150 = bitmapNew.GetThumbnailImage(150, imagesize.Height * 150 / imagesize.Width, myCallback, IntPtr.Zero);
            }

            CloudBlockBlob cloudBlockBlobthaumbnail = cloudBlobContainer.GetBlockBlobReference(fileName + "-thumbnail" + Path.GetExtension(httpPostedFile.FileName));
            cloudBlockBlobthaumbnail.Properties.ContentType = httpPostedFile.ContentType;
            await cloudBlockBlobthaumbnail.UploadFromStreamAsync(ToStream(myThumbnail150, Path.GetExtension(httpPostedFile.FileName).ToLower()));
            return cloudBlockBlobthaumbnail.Uri.ToString();
        }

        public bool ThumbnailCallback()
        {
            return true;
        }

        public static Stream ToStream(Image image, string ext)
        {
            var stream = new MemoryStream();
            if (ext == ".jpeg")
                image.Save(stream, ImageFormat.Jpeg);
            else if (ext == ".png")
                image.Save(stream, ImageFormat.Png);
            else if (ext == ".bmp")
                image.Save(stream, ImageFormat.Bmp);
            else
                image.Save(stream, ImageFormat.Jpeg);

            stream.Position = 0;
            return stream;
        }

        public async Task<string> UploadImage_URL(string file, string fileName, CloudBlobContainer cloudBlobContainer)
        {
            if (!doesUserHaveEnoughSpace(cloudBlobContainer.Name))
            {
                throw new System.InvalidOperationException(StorageFullMessage);
            }
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(file);
            HttpWebResponse response = (HttpWebResponse)request.GetResponse();
            Stream inputStream = response.GetResponseStream();
            //CloudBlockBlob cblob = cont.GetBlockBlobReference(ImageName);
            //cblob.UploadFromStream(inputStream);

            CloudBlockBlob cloudBlockBlob = cloudBlobContainer.GetBlockBlobReference(fileName); //Path.GetExtension(httpPostedFile.FileName));
            cloudBlockBlob.Properties.ContentType = response.ContentType;
            await cloudBlockBlob.UploadFromStreamAsync(inputStream);
            return cloudBlockBlob.Uri.ToString();
        }

        public async Task<string> UploadImage_URL(string file, string fileName)
        {
            CloudBlobContainer cloudBlobContainer = await GetCloudBlobContainer();
            if (!doesUserHaveEnoughSpace(cloudBlobContainer.Name))
            {
                throw new System.InvalidOperationException(StorageFullMessage);
            }

            
            try { 
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(file);
            HttpWebResponse response = (HttpWebResponse)request.GetResponse();
            Stream inputStream = response.GetResponseStream();
            //CloudBlockBlob cblob = cont.GetBlockBlobReference(ImageName);
            //cblob.UploadFromStream(inputStream);

            CloudBlockBlob cloudBlockBlob = cloudBlobContainer.GetBlockBlobReference(fileName); //Path.GetExtension(httpPostedFile.FileName));
            cloudBlockBlob.Properties.ContentType = response.ContentType;
            await cloudBlockBlob.UploadFromStreamAsync(inputStream);
            return cloudBlockBlob.Uri.ToString();
            }
            catch (Exception ex)
            {
                return string.Empty;
            }
        }

        public async Task<string> UploadImage_Base64(string file, string fileName)
        {
            CloudBlobContainer cloudBlobContainer = await GetCloudBlobContainer();
            if (!doesUserHaveEnoughSpace(cloudBlobContainer.Name))
            {
                throw new System.InvalidOperationException(StorageFullMessage);
            }
            try
            {
                byte[] bytes = Convert.FromBase64String(file.Split("base64,")[1]);
                using (var stream = new MemoryStream(bytes))
                {
                    CloudBlockBlob cloudBlockBlob = cloudBlobContainer.GetBlockBlobReference(fileName);
                    await cloudBlockBlob.UploadFromStreamAsync(stream);
                    return cloudBlockBlob.Uri.ToString();
                }
            }
            catch (Exception ex)
            {
                return string.Empty;
            }
        }

        public async Task<string> UploadImage_Base64(string file, string fileName, CloudBlobContainer cloudBlobContainer)
        {
            //CloudBlobContainer cloudBlobContainer = await GetCloudBlobContainer();
            if (!doesUserHaveEnoughSpace(cloudBlobContainer.Name))
            {
                throw new System.InvalidOperationException(StorageFullMessage);
            }
            try
            {
                byte[] bytes = Convert.FromBase64String(file.Split("base64,")[1]);
                using (var stream = new MemoryStream(bytes))
                {
                    CloudBlockBlob cloudBlockBlob = cloudBlobContainer.GetBlockBlobReference(fileName);
                    await cloudBlockBlob.UploadFromStreamAsync(stream);
                    return cloudBlockBlob.Uri.ToString();
                }
            }
            catch (Exception ex)
            {
                return string.Empty;
            }
        }

        public async Task<string> UploadThumbnail_URL(string file, string fileName, CloudBlobContainer cloudBlobContainer)
        {
            if (!doesUserHaveEnoughSpace(cloudBlobContainer.Name))
            {
                throw new System.InvalidOperationException(StorageFullMessage);
            }
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(file);
            HttpWebResponse response = (HttpWebResponse)request.GetResponse();
            Stream inputStream = response.GetResponseStream();

            Image myThumbnail150;
            Image.GetThumbnailImageAbort myCallback = new Image.GetThumbnailImageAbort(ThumbnailCallback);
            Image imagesize = Image.FromStream(inputStream);
            Bitmap bitmapNew = new Bitmap(imagesize);
            if (imagesize.Width < imagesize.Height)
            {
                myThumbnail150 = bitmapNew.GetThumbnailImage(150 * imagesize.Width / imagesize.Height, 150, myCallback, IntPtr.Zero);
            }
            else
            {
                myThumbnail150 = bitmapNew.GetThumbnailImage(150, imagesize.Height * 150 / imagesize.Width, myCallback, IntPtr.Zero);
            }

            CloudBlockBlob cloudBlockBlobthaumbnail = cloudBlobContainer.GetBlockBlobReference(fileName + "-thumbnail" + "jpg"); // Path.GetExtension(httpPostedFile.FileName));
            cloudBlockBlobthaumbnail.Properties.ContentType = response.ContentType;
            await cloudBlockBlobthaumbnail.UploadFromStreamAsync(ToStream(myThumbnail150, "")); //Path.GetExtension(httpPostedFile.FileName).ToLower()));
            return cloudBlockBlobthaumbnail.Uri.ToString();
        }

        public async Task<BlobResponse> BlobStockAllAsync()
        {
            BlobResponse objBlobResponse = new BlobResponse();
            List<Items> _items = new List<Items>();
            try
            {
                //string stockContainers = "stock-defimg-rulesets,stock-defimg-chars,stock-defimg-items,stock-defimg-spells,stock-defimg-abilities,stock-images,stock-icons,stock-defimages";
                string stockContainers =
                   "stock-defimg-rulesets," +
                   "stock-defimg-chars," +
                   "stock-defimg-items," +
                   "stock-defimg-spells," +
                   "stock-defimg-abilities," +
                   "stock-images," +
                   "stock-icons";
                //"stock-defimages";
                string[] stockContainerList = stockContainers.Trim().Split(',');
                foreach (string container in stockContainerList)
                {
                    // List the blobs in the container.
                    BlobContinuationToken blobContinuationToken = null;
                    var cloudBlobContainer = GetCloudBlobContainer(container).Result;
                    do
                    {
                        var results = cloudBlobContainer.ListBlobsSegmentedAsync(null, blobContinuationToken);
                        // Get the value of the continuation token returned by the listing call.
                        blobContinuationToken = results.Result.ContinuationToken;
                        foreach (IListBlobItem _blobItem in results.Result.Results)
                        {
                            CloudBlockBlob item = _blobItem as CloudBlockBlob;
                            if (item != null)
                            {
                                Items _item = new Items();
                                _item.AbsolutePath = item.Uri.AbsolutePath;
                                _item.AbsoluteUri = item.Uri.AbsoluteUri;
                                _item.IsAbsoluteUri = item.Uri.IsAbsoluteUri;
                                _item.OriginalString = item.Uri.OriginalString;
                                _item.Container = item.Container.Name;
                                _item.Size = item.Properties.Length / 1024;
                                _items.Add(_item);
                            }
                        }
                    } while (blobContinuationToken != null); // Loop while the continuation token is not null.
                }
                objBlobResponse.items = _items;
            }
            catch (Exception ex)
            {
            }
            return objBlobResponse;
        }

        public async Task<object> BlobStockAllAsync(int Count = 39, int previousContainerNumber = 0, int previousContainerImageNumber = 0)
        {
            int start = previousContainerImageNumber;
            BlobResponse objBlobResponse = new BlobResponse();
            List<Items> _items = new List<Items>();
            try
            {
                //string stockContainers = "stock-defimg-rulesets,stock-defimg-chars,stock-defimg-items,stock-defimg-spells,stock-defimg-abilities,stock-images,stock-icons,stock-defimages";
                string stockContainers =
                   "stock-defimg-rulesets," +
                   "stock-defimg-chars," +
                   "stock-defimg-items," +
                   "stock-defimg-spells," +
                   "stock-defimg-abilities," +
                   "stock-images," +
                   "stock-icons";
                //"stock-defimages";
                string[] stockContainerList = stockContainers.Trim().Split(',');
                bool flag = true;
                bool flagImage = true;

                for (int i = 0; i < stockContainerList.Length; i++)
                {
                    if (flag)
                    {
                        i = previousContainerNumber;
                        flag = false;
                    }

                    // List the blobs in the container.
                    BlobContinuationToken blobContinuationToken = null;
                    var cloudBlobContainer = GetCloudBlobContainer(stockContainerList[i]).Result;
                    var results = cloudBlobContainer.ListBlobsSegmentedAsync(null, true, BlobListingDetails.All, (start + Count + 1), blobContinuationToken, null, null);
                    // Get the value of the continuation token returned by the listing call.
                    blobContinuationToken = results.Result.ContinuationToken;
                    var StockImagesResult = results.Result.Results.Skip(start).Take(Count).ToList();
                    start = 0;
                    foreach (IListBlobItem _blobItem in StockImagesResult)
                    {
                        CloudBlockBlob item = _blobItem as CloudBlockBlob;
                        if (item != null)
                        {
                            Items _item = new Items();
                            _item.AbsolutePath = item.Uri.AbsolutePath;
                            _item.AbsoluteUri = item.Uri.AbsoluteUri;
                            _item.IsAbsoluteUri = item.Uri.IsAbsoluteUri;
                            _item.OriginalString = item.Uri.OriginalString;
                            _item.Container = item.Container.Name;
                            _item.Size = item.Properties.Length / 1024;
                            _items.Add(_item);
                            if (_items.Count >= Count)
                            {
                                previousContainerNumber = i;
                                previousContainerImageNumber = results.Result.Results.Count() - 1;
                                break;
                            }
                        }
                    }
                    if (_items.Count >= Count)
                    {
                        previousContainerNumber = i;
                        previousContainerImageNumber = results.Result.Results.Count() - 1;
                        break;
                    }
                }
                objBlobResponse.items = _items;
            }
            catch (Exception ex)
            {

            }
            return new { count = Count, previousContainerNumber = previousContainerNumber, blobResponse = objBlobResponse, previousContainerImageNumber = previousContainerImageNumber };

            //int start = previousContainerImageNumber;
            //BlobResponse objBlobResponse = new BlobResponse();
            //List<Items> _items = new List<Items>();
            //try
            //{
            //    //string stockContainers = "stock-defimg-rulesets,stock-defimg-chars,stock-defimg-items,stock-defimg-spells,stock-defimg-abilities,stock-images,stock-icons,stock-defimages";
            //    string stockContainers =
            //       "stock-defimg-rulesets," +
            //       "stock-defimg-chars," +
            //       "stock-defimg-items," +
            //       "stock-defimg-spells," +
            //       "stock-defimg-abilities," +
            //       "stock-images," +
            //       "stock-icons";
            //    //"stock-defimages";
            //    string[] stockContainerList = stockContainers.Trim().Split(',');
            //    foreach (string container in stockContainerList)
            //    {
            //        // List the blobs in the container.
            //        BlobContinuationToken blobContinuationToken = null;
            //        var cloudBlobContainer = GetCloudBlobContainer(container).Result;
            //        do
            //        {
            //            var results = cloudBlobContainer.ListBlobsSegmentedAsync(null, blobContinuationToken);
            //            // Get the value of the continuation token returned by the listing call.
            //            blobContinuationToken = results.Result.ContinuationToken;
            //            foreach (IListBlobItem _blobItem in results.Result.Results)
            //            {
            //                CloudBlockBlob item = _blobItem as CloudBlockBlob;
            //                if (item != null)
            //                {
            //                    Items _item = new Items();
            //                    _item.AbsolutePath = item.Uri.AbsolutePath;
            //                    _item.AbsoluteUri = item.Uri.AbsoluteUri;
            //                    _item.IsAbsoluteUri = item.Uri.IsAbsoluteUri;
            //                    _item.OriginalString = item.Uri.OriginalString;
            //                    _item.Container = item.Container.Name;
            //                    _item.Size = item.Properties.Length / 1024;
            //                    _items.Add(_item);
            //                }
            //            }
            //        } while (blobContinuationToken != null); // Loop while the continuation token is not null.
            //    }
            //    objBlobResponse.items = _items.Skip(start).Take(Count).ToList();
            //}
            //catch (Exception ex)
            //{
            //}
            //return new { count = Count, previousContainerNumber = previousContainerNumber, blobResponse = objBlobResponse, previousContainerImageNumber = previousContainerImageNumber };
        }

        public void DeleteBlobs(List<DeleteBlob> model)
        {
            
            foreach (var item in model)
            {
                var _containerName = item.userContainerName;
                CloudBlobContainer container = GetCloudBlobContainer(_containerName).Result;
                CloudBlockBlob _blockBlob = container.GetBlockBlobReference(item.blobName);
                //delete blob from container    
                _blockBlob.DeleteAsync();
            }
            
        }

        public async Task<BlobResponse> BlobMyImagesAsync(string container)
        {
            BlobResponse objBlobResponse = new BlobResponse();
            List<Items> _items = new List<Items>();
            try
            {
                BlobContinuationToken blobContinuationToken = null;
                var cloudBlobContainer = GetCloudBlobContainer(container).Result;
                do
                {
                    var results = cloudBlobContainer.ListBlobsSegmentedAsync(null, blobContinuationToken);
                    blobContinuationToken = results.Result.ContinuationToken;

                    foreach (IListBlobItem _blobItem in results.Result.Results)
                    {
                        CloudBlockBlob item = _blobItem as CloudBlockBlob;
                        if (item != null)
                        {
                            Items _item = new Items();
                            _item.AbsolutePath = item.Uri.AbsolutePath;
                            _item.AbsoluteUri = item.Uri.AbsoluteUri;
                            _item.IsAbsoluteUri = item.Uri.IsAbsoluteUri;
                            _item.OriginalString = item.Uri.OriginalString;
                            _item.Container = item.Container.Name;
                            _item.Size = item.Properties.Length / 1024;
                            _item.LastModifiedDate = item.Properties.LastModified;
                            _item.ContentType = item.Properties.ContentType;
                            _items.Add(_item);
                        }
                    }
                } while (blobContinuationToken != null);
                _items = _items.OrderByDescending(q => q.LastModifiedDate).ToList();
                objBlobResponse.items = _items;
            }
            catch (Exception ex)
            {
            }
            return objBlobResponse;
        }

        public async Task<object> BlobMyImagesAsync(string container, int Count = 39, int previousContainerImageNumber = 0)
        {
            int start = previousContainerImageNumber;
            BlobResponse objBlobResponse = new BlobResponse();
            List<Items> _items = new List<Items>();
            List<Items> _Tempitems = new List<Items>();
            try
            {
                //BlobContinuationToken blobContinuationToken = null;
                //var cloudBlobContainer = GetCloudBlobContainer(container).Result;
                ////do
                ////{
                //var results = cloudBlobContainer.ListBlobsSegmentedAsync(null, true, BlobListingDetails.All, (start + Count + 1), blobContinuationToken, null, null);

                ////var results = cloudBlobContainer.ListBlobsSegmentedAsync(null, blobContinuationToken);
                //blobContinuationToken = results.Result.ContinuationToken;

                //var StockImagesResult = results.Result.Results.ToList();

                //foreach (IListBlobItem _TempblobItem in StockImagesResult)
                //{
                //    CloudBlockBlob item = _TempblobItem as CloudBlockBlob;
                //    if (item != null)
                //    {
                //        Items _item = new Items();
                //        _item.AbsolutePath = item.Uri.AbsolutePath;
                //        _item.AbsoluteUri = item.Uri.AbsoluteUri;
                //        _item.IsAbsoluteUri = item.Uri.IsAbsoluteUri;
                //        _item.OriginalString = item.Uri.OriginalString;
                //        _item.Container = item.Container.Name;
                //        _item.Size = item.Properties.Length / 1024;
                //        _item.LastModifiedDate = item.Properties.LastModified;
                //        _item.ContentType = item.Properties.ContentType;
                //        _Tempitems.Add(_item);                      
                //    }
                //}

                //_Tempitems = _Tempitems.OrderByDescending(q => q.LastModifiedDate).Skip(start).Take(Count).ToList();

                //foreach (Items item in _Tempitems)
                //{
                //    //CloudBlockBlob item = _blobItem as CloudBlockBlob;
                //    if (item != null)
                //    {
                //        Items _item = new Items();
                //        _item.AbsolutePath = item.AbsolutePath;
                //        _item.AbsoluteUri = item.AbsoluteUri;
                //        _item.IsAbsoluteUri = item.IsAbsoluteUri;
                //        _item.OriginalString = item.OriginalString;
                //        _item.Container = item.Container;
                //        _item.Size = item.Size;
                //        _item.LastModifiedDate = item.LastModifiedDate;
                //        _item.ContentType = item.ContentType;
                //        _items.Add(_item);

                //        if (_items.Count >= Count)
                //        {
                //            previousContainerImageNumber = results.Result.Results.Count() - 1;
                //            break;
                //        }
                //    }
                //}
                ////} while (blobContinuationToken != null);
                //_items = _items.OrderByDescending(q => q.LastModifiedDate).ToList();
                //objBlobResponse.items = _items;

                BlobContinuationToken blobContinuationToken = null;
                var cloudBlobContainer = GetCloudBlobContainer(container).Result;
                do
                {
                    var results = cloudBlobContainer.ListBlobsSegmentedAsync(null, blobContinuationToken);
                    blobContinuationToken = results.Result.ContinuationToken;

                    foreach (IListBlobItem _blobItem in results.Result.Results)
                    {
                        CloudBlockBlob item = _blobItem as CloudBlockBlob;
                        if (item != null)
                        {
                            Items _item = new Items();
                            _item.AbsolutePath = item.Uri.AbsolutePath;
                            _item.AbsoluteUri = item.Uri.AbsoluteUri;
                            _item.IsAbsoluteUri = item.Uri.IsAbsoluteUri;
                            _item.OriginalString = item.Uri.OriginalString;
                            _item.Container = item.Container.Name;
                            _item.Size = item.Properties.Length / 1024;
                            _item.LastModifiedDate = item.Properties.LastModified;
                            _item.ContentType = item.Properties.ContentType;
                            _items.Add(_item);
                        }
                    }
                } while (blobContinuationToken != null);
                _items = _items.OrderByDescending(q => q.LastModifiedDate).ToList();
                bool flag = false;
                if (start + Count <= _items.Count())
                {
                    flag = true;
                }

                _items = _items.Skip(start).Take(Count).ToList();

                previousContainerImageNumber = flag ? (_items.Count() + 1) : _items.Count();
                

                objBlobResponse.items = _items;
            }
            catch (Exception ex)
            {
            }
            //  return objBlobResponse;
            return new { count = Count, blobResponse = objBlobResponse, previousContainerImageNumber = previousContainerImageNumber };

        }

        public async Task<string> GetDefaultImage(string type = "")
        {
            List<Items> _items = new List<Items>();
            try
            {
                // List the blobs in the container.
                BlobContinuationToken blobContinuationToken = null;
                CloudBlobContainer cloudBlobContainer = null;// GetCloudBlobContainer().Result;
                switch (type.ToLower())
                {
                    case "char":
                        cloudBlobContainer = GetCloudBlobContainer("stock-defimg-chars").Result;
                        break;
                    case "item":
                        cloudBlobContainer = GetCloudBlobContainer("stock-defimg-items").Result;
                        break;
                    case "spell":
                        cloudBlobContainer = GetCloudBlobContainer("stock-defimg-spells").Result;
                        break;
                    case "ability":
                        cloudBlobContainer = GetCloudBlobContainer("stock-defimg-abilities").Result;
                        break;
                    case "ruleset":
                        cloudBlobContainer = GetCloudBlobContainer("stock-defimg-rulesets").Result;
                        break;
                    case "stock":
                        cloudBlobContainer = GetCloudBlobContainer().Result;
                        break;
                    case "myimage":
                        cloudBlobContainer = GetCloudBlobContainer().Result;
                        break;
                        //default:
                        //    cloudBlobContainer = GetCloudBlobContainer().Result;
                        //    break;
                }
                var results = cloudBlobContainer.ListBlobsSegmentedAsync(null, blobContinuationToken).Result.Results;
                if (results.Any())
                {
                    Random rnd = new Random();
                    int randomIndex = rnd.Next(results.Count());
                    return results.ToList()[randomIndex].Uri.AbsoluteUri;
                }
                return null;
            }
            catch (Exception ex)
            {
                return null;
            }
        }
        public async Task<List<string>> BlobGetDefaultImageList(string type = "")
        {
            List<Items> _items = new List<Items>();
            try
            {
                // List the blobs in the container.
                BlobContinuationToken blobContinuationToken = null;
                CloudBlobContainer cloudBlobContainer = null;// GetCloudBlobContainer().Result;
                switch (type.ToLower())
                {
                    case "char":
                        cloudBlobContainer = GetCloudBlobContainer("stock-defimg-chars").Result;
                        break;
                    case "item":
                        cloudBlobContainer = GetCloudBlobContainer("stock-defimg-items").Result;
                        break;
                    case "spell":
                        cloudBlobContainer = GetCloudBlobContainer("stock-defimg-spells").Result;
                        break;
                    case "ability":
                        cloudBlobContainer = GetCloudBlobContainer("stock-defimg-abilities").Result;
                        break;
                    case "ruleset":
                        cloudBlobContainer = GetCloudBlobContainer("stock-defimg-rulesets").Result;
                        break;
                    case "stock":
                        cloudBlobContainer = GetCloudBlobContainer().Result;
                        break;
                    case "myimage":
                        cloudBlobContainer = GetCloudBlobContainer().Result;
                        break;
                        //default:
                        //    cloudBlobContainer = GetCloudBlobContainer().Result;
                        //    break;
                }
                var results = cloudBlobContainer.ListBlobsSegmentedAsync(null, blobContinuationToken).Result.Results;
                //if (results.Any())
                //{
                //    Random rnd = new Random();
                //    int randomIndex = rnd.Next(results.Count());
                //    return results.ToList()[randomIndex].Uri.AbsoluteUri;
                //}
                List<string> res = new List<string>();
                foreach (var item in results)
                {
                    res.Add(item.Uri.AbsoluteUri);
                }
                return res;
            }
            catch (Exception ex)
            {
                return null;
            }
        }
        public double GetSpaceUsed(string container)
        {
            try
            {
                BlobContinuationToken blobContinuationToken = null;
                var cloudBlobContainer = GetCloudBlobContainer(container).Result;
                var results = cloudBlobContainer.ListBlobsSegmentedAsync(null, blobContinuationToken);
                blobContinuationToken = results.Result.ContinuationToken;

                if (results.Result == null) return 0;

                long blobSizeInBytes = (from CloudBlockBlob blob in results.Result.Results.OfType<CloudBlockBlob>()
                                        select blob.Properties.Length).Sum();

                return ConvertBytesToMegabytes(blobSizeInBytes);
            }
            catch { }
            return 0;
        }

        public double ConvertBytesToMegabytes(long bytes) => (bytes / 1024f) / 1024f;
        public double ConvertKilobytesToMegabytes(long kilobytes) => kilobytes / 1024f;
        private bool doesUserHaveEnoughSpace(string container)
        {
            bool res = true;
            string userName = _httpContextAccessor.HttpContext.User.Identities.Select(x => x.Name).FirstOrDefault();
            ApplicationUser appUser = _accountManager.GetUserByUserNameAsync(userName).Result;
            UserSubscription subs = _accountManager.userSubscriptions(appUser.Id).Result;
            if (subs!=null)
            {
                if (GetSpaceUsed(container)>=subs.StorageSpaceInMB)
                {
                    res = false;
                }
            }
            return res;
        }
    }
}
