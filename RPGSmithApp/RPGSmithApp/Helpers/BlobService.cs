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
using DAL.Services;

namespace RPGSmithApp.Helpers
{
    public class BlobService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAccountManager _accountManager;
        private readonly IRuleSetService _rulesetService;
        const string StorageFullMessage = "Your account storage space is full. Please buy more space to upload more files.";
      
        public BlobService(IHttpContextAccessor httpContextAccessor, IAccountManager accountManager, IRuleSetService rulesetService) {
            _httpContextAccessor = httpContextAccessor;
            _accountManager = accountManager;
            _rulesetService = rulesetService;
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

        public async Task<string> UploadImages(IFormFile httpPostedFile, string fileName, CloudBlobContainer cloudBlobContainer, string userId=null)
        {
            if (!doesUserHaveEnoughSpace(cloudBlobContainer.Name, userId))
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

        public async Task<string> UploadThumbnail(IFormFile httpPostedFile, string fileName, CloudBlobContainer cloudBlobContainer,bool isRegistering=false)
        {
            if (!isRegistering && !doesUserHaveEnoughSpace(cloudBlobContainer.Name))
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

                    int loopCount = 0;
                    foreach (IListBlobItem _blobItem in StockImagesResult)
                    {
                        loopCount = loopCount + 1;
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
                                previousContainerImageNumber = loopCount;//results.Result.Results.Count() - 1;
                                break;
                            }
                        }
                    }
                    if (_items.Count >= Count)
                    {
                        previousContainerNumber = i;
                        previousContainerImageNumber = loopCount;// results.Result.Results.Count() - 1;
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

        public async Task DeleteBlobs(List<DeleteBlob> model, string prefixToGetFolderContent = "")
        {
            
            foreach (var item in model)
            {
                var _containerName = item.userContainerName;
                CloudBlobContainer container = GetCloudBlobContainer(_containerName).Result;
                if (string.IsNullOrEmpty(prefixToGetFolderContent))
                {
                   
                    CloudBlockBlob _blockBlob = container.GetBlockBlobReference(item.blobName);
                    //delete blob from container    
                    await  _blockBlob.DeleteIfExistsAsync();
                }
                else
                {

                    CloudBlobContainer sourceContainer = container;
                    CloudBlobDirectory directory = sourceContainer.GetDirectoryReference(prefixToGetFolderContent);
                    CloudBlockBlob blockblob = directory.GetBlockBlobReference(item.blobName);
                    await blockblob.DeleteIfExistsAsync();
                }
                
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
                            if (item.Properties.ContentType.Contains("image"))
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
                    }
                } while (blobContinuationToken != null);
                _items = _items.OrderByDescending(q => q.LastModifiedDate).ToList();
                bool flag = false;
                if (start + Count <= _items.Count())
                {
                    flag = true;
                }

                _items = _items.Skip(start).Take(Count).ToList();

                previousContainerImageNumber = flag ? (start+ Count) : _items.Count();
                

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
        private bool doesUserHaveEnoughSpace(string container, string userId=null)
        {
            bool res = true;
            UserSubscription subs = null;
            if (string.IsNullOrEmpty(userId))
            {
                string userName = _httpContextAccessor.HttpContext.User.Identities.Select(x => x.Name).FirstOrDefault();
                ApplicationUser appUser = _accountManager.GetUserByUserNameAsync(userName).Result;
                subs = _accountManager.userSubscriptions(appUser.Id).Result;
                userId = appUser.Id;
            }
            else {
                subs = _accountManager.userSubscriptions(userId).Result;
            }
            
            
            if (subs!=null)
            {
                var UserCampaigns = _rulesetService.GetRuleSetByUserId(userId).Result;
                double TotalSpaceUsed = GetSpaceUsed("user-" + userId);
                foreach (var camp in UserCampaigns)
                {
                    double handoutContainer = GetSpaceUsed("user-" + userId + "-handout" + "-" + camp.RuleSetId);
                    TotalSpaceUsed = TotalSpaceUsed + handoutContainer;
                }
                if (TotalSpaceUsed >= subs.StorageSpaceInMB)
                {
                    res = false;
                }
            }
            return res;
        }
        public async Task<string> Uploadhandout(IFormFile httpPostedFile, string fileName, CloudBlobContainer cloudBlobContainer, string userId)
        {
            if (!doesUserHaveEnoughSpace(cloudBlobContainer.Name,userId))
            {
                throw new System.InvalidOperationException(StorageFullMessage);
            }
            CloudBlockBlob cloudBlockBlob = cloudBlobContainer.GetBlockBlobReference(fileName + "" + Path.GetExtension(httpPostedFile.FileName));

            
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
             
        }
        public async Task<string> UploadhandoutFolder(IFormFile httpPostedFile, string fileName, CloudBlobContainer cloudBlobContainer, string userId, string folderName)
        {
            if (!doesUserHaveEnoughSpace(cloudBlobContainer.Name, userId))
            {
                throw new System.InvalidOperationException(StorageFullMessage);
            }
            if (httpPostedFile==null && !string.IsNullOrEmpty(folderName)) 
            {
                CloudBlobContainer sourceContainer = cloudBlobContainer;// GetCloudBlobContainer("user-248c6bae-fab3-4e1f-b91b-f674de70a65d-handout").Result;
                CloudBlobDirectory directory = sourceContainer.GetDirectoryReference(folderName);
                CloudBlockBlob blockblob = directory.GetBlockBlobReference(fileName + ".txt");
                //CloudBlockBlob cloudBlockBlob = cloudBlobContainer.GetBlockBlobReference(fileName + ".txt");
                // var blob = cloudBlobContainer.GetBlobReference(fileName);
                await blockblob.UploadTextAsync("");
                return blockblob.Uri.ToString();
            }
            else
            {
                CloudBlockBlob cloudBlockBlob = cloudBlobContainer.GetBlockBlobReference(fileName + "" + Path.GetExtension(httpPostedFile.FileName));


                using (var ms1 = new MemoryStream())
                {
                    //Create folder in container
                    CloudBlobContainer sourceContainer = cloudBlobContainer;// GetCloudBlobContainer("user-248c6bae-fab3-4e1f-b91b-f674de70a65d-handout").Result;
                    CloudBlobDirectory directory = sourceContainer.GetDirectoryReference(folderName);
                    CloudBlockBlob blockblob = directory.GetBlockBlobReference(fileName + "" + Path.GetExtension(httpPostedFile.FileName));
                    //await blockblob.UploadFromFileAsync(@"F:\Vikas\Projects\Work for GM Account\RPGSmithApp\RPGSmithApp\ClientApp\src\favicon.ico");

                    httpPostedFile.CopyTo(ms1);
                    var fileBytes = ms1.ToArray();
                    Stream ms = new MemoryStream(fileBytes);
                    FileStreamResult res = new FileStreamResult(ms, httpPostedFile.ContentType);
                    blockblob.Properties.ContentType = res.ContentType;
                    await blockblob.UploadFromStreamAsync(ms);
                    return blockblob.Uri.ToString();
                }
            }

        }
        //public async Task<BlobResponse> BlobMyHandoutsAsync(string container)
        //{
        //    BlobResponse objBlobResponse = new BlobResponse();
        //    List<Items> _items = new List<Items>();
        //    try
        //    {
        //        BlobContinuationToken blobContinuationToken = null;
        //        var cloudBlobContainer = GetCloudBlobContainer(container).Result;
        //        do
        //        {
        //            var results = cloudBlobContainer.ListBlobsSegmentedAsync(null, blobContinuationToken);
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
        //                    _item.LastModifiedDate = item.Properties.LastModified;
        //                    _item.ContentType = item.Properties.ContentType;
        //                    _item.name = item.Name;
        //                    _items.Add(_item);
        //                }
        //            }
        //        } while (blobContinuationToken != null);
        //        _items = _items.OrderByDescending(q => q.LastModifiedDate).ToList();
        //        objBlobResponse.items = _items;
        //    }
        //    catch (Exception ex)
        //    {
        //    }
        //    return objBlobResponse;
        //}
        public async Task<object> BlobMyHandoutsAsync(string container, int Count = 39, int previousContainerImageNumber = 0, string prefixToGetFolderContent = "")
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
                    if (string.IsNullOrEmpty(prefixToGetFolderContent))
                    {
                        prefixToGetFolderContent = null;
                    }
                    var results = cloudBlobContainer.ListBlobsSegmentedAsync(prefixToGetFolderContent, blobContinuationToken);
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
                            _item.name = item.Name;
                            if (!_item.name.Contains("default_folder_file.txt"))
                            {
                                _items.Add(_item);
                            }
                            
                        }
                        else 
                        {
                            CloudBlobDirectory dir = _blobItem as CloudBlobDirectory;
                            if (dir!=null)
                            {
                                Items _item = new Items();
                                _item.AbsolutePath = string.Empty;
                                _item.AbsoluteUri = string.Empty;
                                _item.IsAbsoluteUri = false;
                                _item.OriginalString = string.Empty;
                                _item.Container = dir.Container.Name;
                                _item.Size = 0;
                                _item.LastModifiedDate = new DateTimeOffset();
                                _item.ContentType = string.Empty;
                                _item.IsFolder = true;
                                _item.name = dir.Prefix;
                                _items.Add(_item);
                            }
                        }
                    }
                } while (blobContinuationToken != null);
                _items = _items.OrderByDescending(q => q.LastModifiedDate).ToList();
                _items = _items.OrderByDescending(q => q.IsFolder).ToList();
                bool flag = false;
                if (start + Count <= _items.Count())
                {
                    flag = true;
                }

                _items = _items.Skip(start).Take(Count).ToList();

                previousContainerImageNumber = flag ? (start + Count) : _items.Count();


                objBlobResponse.items = _items;
            }
            catch (Exception ex)
            {
            }
            /////////////////////////////////////////////////////////////
            //bool flag1111 = false;
            //if (flag1111)
            //{
            //    //await CopyMoveFile(GetCloudBlobContainer(container).Result, "sample123.pdf","new2/", "new/");
            //    //await DeleteFolder(GetCloudBlobContainer(container).Result, "test/");
            //}
          
            /////////////////////////////////////////////////////////////
            //  return objBlobResponse;
            return new { count = Count, blobResponse = objBlobResponse, previousContainerImageNumber = previousContainerImageNumber };

        }
        public async Task<bool> RenameFile(CloudBlobContainer cloudBlobContainer,string oldFileName, string newFileName, string prefixToGetFolderContent = "")
        {
            try
            {
                CloudBlockBlob blobCopy = null;
                if (string.IsNullOrEmpty(prefixToGetFolderContent))
                {
                    blobCopy = cloudBlobContainer.GetBlockBlobReference(newFileName);                   
                }
                else
                {
                    CloudBlobContainer sourceContainer = cloudBlobContainer;
                    CloudBlobDirectory directory = sourceContainer.GetDirectoryReference(prefixToGetFolderContent);
                    blobCopy = directory.GetBlockBlobReference(newFileName);                   
                }
                //CloudBlockBlob blobCopy = cloudBlobContainer.GetBlockBlobReference(newFileName);
                if (! await blobCopy.ExistsAsync())
                {
                    CloudBlockBlob blob = null;
                    if (string.IsNullOrEmpty(prefixToGetFolderContent))
                    {
                        blob = cloudBlobContainer.GetBlockBlobReference(oldFileName);
                    }
                    else
                    {
                        CloudBlobContainer sourceContainer = cloudBlobContainer;
                        CloudBlobDirectory directory = sourceContainer.GetDirectoryReference(prefixToGetFolderContent);
                        blob = directory.GetBlockBlobReference(oldFileName);
                    }
                    
                    if (await blob.ExistsAsync())
                    {
                        await blobCopy.StartCopyAsync(blob);
                        await blob.DeleteIfExistsAsync();
                    }
                }
                return true;
            }
            catch (Exception ex) {
                throw ex;
            }
           
        }
        public async Task<bool> CopyMoveFile(CloudBlobContainer cloudBlobContainer, string FileNameToMove, string FolderNameToPasteFile="",string prefixToGetFolderContent="",bool isCopy=false)
        {
            try
            {
                //copy blob from one container to other
                CloudBlobContainer sourceContainer = cloudBlobContainer;
                CloudBlobContainer targetContainer = cloudBlobContainer;


                CloudBlockBlob sourceBlob = null;
                if (string.IsNullOrEmpty(prefixToGetFolderContent))
                {
                    sourceBlob = cloudBlobContainer.GetBlockBlobReference(FileNameToMove);
                }
                else
                {
                    //CloudBlobContainer sourceContainer = cloudBlobContainer;
                    CloudBlobDirectory directory = sourceContainer.GetDirectoryReference(prefixToGetFolderContent);
                    sourceBlob = directory.GetBlockBlobReference(FileNameToMove);
                }
                //CloudBlockBlob sourceBlob = sourceContainer.GetBlockBlobReference(blobName);

                CloudBlockBlob targetBlob = null;
                if (string.IsNullOrEmpty(FolderNameToPasteFile))
                {
                    targetBlob = cloudBlobContainer.GetBlockBlobReference(FileNameToMove);
                }
                else
                {
                    //CloudBlobContainer sourceContainer = cloudBlobContainer;
                    CloudBlobDirectory directory = sourceContainer.GetDirectoryReference(FolderNameToPasteFile);
                    targetBlob = directory.GetBlockBlobReference(FileNameToMove);
                }
                //CloudBlockBlob targetBlob = targetContainer.GetBlockBlobReference(blobName + "_copy");
                await targetBlob.StartCopyAsync(sourceBlob);
                if (!isCopy)
                {
                    await sourceBlob.DeleteIfExistsAsync();
                }                
                return true;
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
        public async Task<bool> DeleteFolder(CloudBlobContainer container, string prefixToGetFolderContent = "")
        {
            try
            {
                BlobContinuationToken blobContinuationToken = null;
                var cloudBlobContainer = container;
                do
                {
                    if (string.IsNullOrEmpty(prefixToGetFolderContent))
                    {
                        prefixToGetFolderContent = null;
                        return false;
                    }
                    var results = cloudBlobContainer.ListBlobsSegmentedAsync(prefixToGetFolderContent, blobContinuationToken);
                    blobContinuationToken = results.Result.ContinuationToken;

                    foreach (IListBlobItem _blobItem in results.Result.Results)
                    {
                        CloudBlockBlob item = _blobItem as CloudBlockBlob;
                        if (item!=null)
                        {
                            await item.DeleteIfExistsAsync();
                            //CloudBlockBlob _blockBlob = cloudBlobContainer.GetBlockBlobReference(item.Name);
                            ////delete blob from container    
                            //await _blockBlob.DeleteAsync();
                        }
                        // CloudBlockBlob _blockBlob = cloudBlobContainer.GetBlockBlobReference(item.Name);
                        // //delete blob from container    
                        //await _blockBlob.DeleteAsync();
                        //// await item.DeleteIfExistsAsync();
                    }
                } while (blobContinuationToken != null);
                return true;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public async Task<List<Items>> All_BlobMyHandoutsForSearchAsync(string container, int Count = 99999999, int previousContainerImageNumber = 0, string prefixToGetFolderContent = "")
        {
            //int Count = 99999999; int previousContainerImageNumber = 0; string prefixToGetFolderContent = "";
            List<Items> result = new List<Items>();
               int start = previousContainerImageNumber;
            BlobResponse objBlobResponse = new BlobResponse();
            List<Items> _items = new List<Items>();
            List<Items> _Tempitems = new List<Items>();
            try
            {
                BlobContinuationToken blobContinuationToken = null;
                var cloudBlobContainer = GetCloudBlobContainer(container).Result;
                do
                {
                    if (string.IsNullOrEmpty(prefixToGetFolderContent))
                    {
                        prefixToGetFolderContent = null;
                    }
                    var results = cloudBlobContainer.ListBlobsSegmentedAsync(prefixToGetFolderContent, blobContinuationToken);
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
                            
                            if (string.IsNullOrEmpty(prefixToGetFolderContent))
                            {
                                _item.name = item.Name;
                            }
                            else {                                
                                _item.name = item.Name.Replace(prefixToGetFolderContent, "");
                            }
                            
                            if (!_item.name.Contains("default_folder_file.txt"))
                            {
                                _items.Add(_item);
                            }

                        }
                        else
                        {
                            CloudBlobDirectory dir = _blobItem as CloudBlobDirectory;
                            if (dir != null)
                            {
                                Items _item = new Items();
                                _item.AbsolutePath = string.Empty;
                                _item.AbsoluteUri = string.Empty;
                                _item.IsAbsoluteUri = false;
                                _item.OriginalString = string.Empty;
                                _item.Container = dir.Container.Name;
                                _item.Size = 0;
                                _item.LastModifiedDate = new DateTimeOffset();
                                _item.ContentType = string.Empty;
                                _item.IsFolder = true;
                                _item.name = dir.Prefix;
                                //_items.Add(_item);

                                var folderFiles = await All_BlobMyHandoutsForSearchAsync(container,99999999,0, dir.Prefix);
                                foreach (var file in folderFiles)
                                {
                                    _items.Add(file);
                                }
                            }
                        }
                    }
                } while (blobContinuationToken != null);
                _items = _items.OrderByDescending(q => q.LastModifiedDate).ToList();
                _items = _items.OrderByDescending(q => q.IsFolder).ToList();
                bool flag = false;
                if (start + Count <= _items.Count())
                {
                    flag = true;
                }

                _items = _items.Skip(start).Take(Count).ToList();

                previousContainerImageNumber = flag ? (start + Count) : _items.Count();


                objBlobResponse.items = _items;
            }
            catch (Exception ex)
            {
            }
            /////////////////////////////////////////////////////////////
            //bool flag1111 = false;
            //if (flag1111)
            //{
            //    //await CopyMoveFile(GetCloudBlobContainer(container).Result, "sample123.pdf","new2/", "new/");
            //    //await DeleteFolder(GetCloudBlobContainer(container).Result, "test/");
            //}

            /////////////////////////////////////////////////////////////
            //  return objBlobResponse;
            foreach (var item in objBlobResponse.items)
            {
                result.Add(item);
            }
            return result;

        }

    }
}


//copy blob from one container to other
// CloudBlobContainer sourceContainer = GetCloudBlobContainer("user-248c6bae-fab3-4e1f-b91b-f674de70a65d-handout").Result;
// CloudBlobContainer targetContainer = GetCloudBlobContainer("user-248c6bae-fab3-4e1f-b91b-f674de70a65d").Result;
// string blobName = "1_01-05-2019_16:30:28.png";
// CloudBlockBlob sourceBlob = sourceContainer.GetBlockBlobReference(blobName);
// CloudBlockBlob targetBlob = targetContainer.GetBlockBlobReference(blobName+"_copy");
//await targetBlob.StartCopyAsync(sourceBlob);


//Create folder in container
// CloudBlobContainer sourceContainer = GetCloudBlobContainer("user-248c6bae-fab3-4e1f-b91b-f674de70a65d-handout").Result;
// CloudBlobDirectory directory = sourceContainer.GetDirectoryReference("00_Folder");
// CloudBlockBlob blockblob = directory.GetBlockBlobReference("favicon1.ico");
//await blockblob.UploadFromFileAsync(@"F:\Vikas\Projects\Work for GM Account\RPGSmithApp\RPGSmithApp\ClientApp\src\favicon.ico");



