using AutoMapper;
using DAL.Core.Interfaces;
using DAL.Models;
using DAL.Models.APIModels;
using DAL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.WindowsAzure.Storage.Blob;
using RPGSmithApp.Helpers;
using RPGSmithApp.ViewModels;
using RPGSmithApp.ViewModels.EditModels;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace RPGSmithApp.Controllers
{

    // [Authorize]
    [Route("api/[controller]")]
    public class ImageController : Controller
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAccountManager _accountManager;
        private readonly IImageService _imageService;
        private readonly IRuleSetService _rulesetService;
        private readonly BlobService bs = new BlobService(null,null,null);

        public ImageController(IHttpContextAccessor httpContextAccessor, IAccountManager accountManager,
            IImageService imageService, IRuleSetService rulesetService)
        {
            _httpContextAccessor = httpContextAccessor;
            _accountManager = accountManager;
            _imageService = imageService;
            _rulesetService = rulesetService;
            bs = new BlobService(_httpContextAccessor, _accountManager, _rulesetService);
        }

        [HttpGet("BingSearch")]
        public async Task<IActionResult> BingSearch(string q, int count=0)
        {
            return Ok(_imageService.BingImageSearchAsync(q,count).Result);
        }

        [HttpGet("BlobStock")]
        public async Task<IActionResult> BlobStock(string q)
        {
            return Ok(bs.BlobStockAllAsync());
        }

        [HttpGet("BlobStockPaging")]
        public async Task<IActionResult> BlobStock(int Count = 39, int previousContainerNumber = 0, int previousContainerImageNumber = 0)
        {
            return Ok(bs.BlobStockAllAsync(Count, previousContainerNumber,previousContainerImageNumber));
        }

        [HttpGet("MyImages")]
        public async Task<IActionResult> MyImages(string q, string id)
        {
            return Ok(bs.BlobMyImagesAsync("user-" + id));
        }
        [HttpGet("MyImagesPaging")]
        public async Task<IActionResult> MyImages(string q, string id, int Count = 39, int previousContainerImageNumber = 0)
        {
            return Ok(bs.BlobMyImagesAsync("user-" + id, Count, previousContainerImageNumber));
        }

        [HttpGet("GetBlobSpaceUsed")]
        public async Task<IActionResult> GetBlobSpaceUsed(string userId)
        {
            double TotalSpaceUsed = 0;
            var UserCampaigns =await _rulesetService.GetRuleSetByUserId(userId);
            TotalSpaceUsed = bs.GetSpaceUsed("user-" + userId);
            foreach (var camp in UserCampaigns)
            {
                double handoutContainer = bs.GetSpaceUsed("user-" + userId + "-handout" + "-" + camp.RuleSetId);
                TotalSpaceUsed = TotalSpaceUsed + handoutContainer;
            }
            
            return Ok(TotalSpaceUsed);
        }

        [HttpPost("uploadBlobImage")]
        public async Task<IActionResult> uploadBlobImage()
        {

            if (_httpContextAccessor.HttpContext.Request.Form.Files.Any())
            {
                // Get the uploaded image from the Files collection
                var httpPostedFile = _httpContextAccessor.HttpContext.Request.Form.Files["UploadedImage"];

                if (httpPostedFile != null)
                {
                    try
                    {
                        BlobService bs = new BlobService(_httpContextAccessor, _accountManager, _rulesetService);
                        var container = bs.GetCloudBlobContainer().Result;
                        string imageName = Guid.NewGuid().ToString();
                        dynamic Response = new ExpandoObject();
                        Response.ImageUrl = bs.UploadImages(httpPostedFile, imageName, container).Result;
                        Response.ThumbnailUrl = Response.ImageUrl; // bs.UploadThumbnail(httpPostedFile, imageName, container).Result;

                        return Ok(Response);
                    }
                    catch (Exception ex)
                    {
                        return BadRequest(ex.Message);
                    }
                }

                return BadRequest();
            }
            return BadRequest("No Image Selected");

        }

        [HttpPost("uploadByUserId")]
        public async Task<IActionResult> uploadByUserId(string userId, bool isRegistering = false)
        {
            if (!isRegistering)
            {
                if (_httpContextAccessor.HttpContext.Request.Form.Files.Any())
                {
                    // Get the uploaded image from the Files collection
                    var httpPostedFile = _httpContextAccessor.HttpContext.Request.Form.Files["UploadedImage"];

                    if (httpPostedFile != null)
                    {
                        try
                        {
                            BlobService bs = new BlobService(_httpContextAccessor, _accountManager, _rulesetService);
                            var container = bs.GetCloudBlobContainer("user-" + userId).Result;
                            string imageName = Guid.NewGuid().ToString();
                            dynamic Response = new ExpandoObject();
                            Response.ImageUrl = bs.UploadImages(httpPostedFile, imageName, container).Result;
                            Response.ThumbnailUrl = Response.ImageUrl; // bs.UploadThumbnail(httpPostedFile, imageName, container).Result;

                            return Ok(Response);
                        }
                        catch (Exception ex)
                        {
                            return BadRequest(ex.Message);
                        }
                    }

                    return BadRequest();
                }
                return BadRequest("No Image Selected");
            }
            else { //to solve image upload issue while registering a user.
                if (_httpContextAccessor.HttpContext.Request.Form.Files.Any())
                {
                    try
                    {
                        // Get the uploaded image from the Files collection
                        var httpPostedFile = _httpContextAccessor.HttpContext.Request.Form.Files["UploadedImage"];
                        if (httpPostedFile != null)
                        {
                            //var dirPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/UploadedFiles/Profile");
                            //try
                            //{
                            //    if (!Directory.Exists(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/UploadedFiles")))
                            //    {
                            //        Directory.CreateDirectory(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/UploadedFiles"));
                            //        Directory.CreateDirectory(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/UploadedFiles/Profile"));
                            //    }
                            //    else if (!Directory.Exists(dirPath)) Directory.CreateDirectory(dirPath);
                            //}
                            //catch { }

                            //var path = Path.Combine(dirPath, httpPostedFile.FileName);
                            //using (var stream = new FileStream(path, FileMode.Create))
                            //{
                            //    await httpPostedFile.CopyToAsync(stream);
                            //}
                            //return Ok(httpPostedFile.FileName + " uploaded successfully.");


                            BlobService bs = new BlobService(_httpContextAccessor, _accountManager, _rulesetService);
                            var container = bs.GetCloudBlobContainer().Result;
                            string imageName = Guid.NewGuid().ToString();

                            dynamic Response = new ExpandoObject();
                            Response.ProfileImage = bs.UploadThumbnail(httpPostedFile, imageName, container,isRegistering).Result;

                            return Ok(Response);

                        }
                    }
                    catch (Exception ex)
                    {
                        return BadRequest(ex.Message);
                    }
                }
                return BadRequest("No Image Selected");
            }
           

        }
        [HttpPost("uploadVideoByUserId")]
        public async Task<IActionResult> uploadVideoByUserId(string userId)
        {

            if (_httpContextAccessor.HttpContext.Request.Form.Files.Any())
            {
                // Get the uploaded image from the Files collection
                var httpPostedFile = _httpContextAccessor.HttpContext.Request.Form.Files["video_param"];

                if (httpPostedFile != null)
                {
                    try
                    {
                        BlobService bs = new BlobService(_httpContextAccessor, _accountManager, _rulesetService);
                        var container = bs.GetCloudBlobContainer("user-" + userId).Result;
                        string imageName = Guid.NewGuid().ToString();
                        return Ok(bs.Uploadvideos(httpPostedFile, imageName, container).Result);
                    }
                    catch (Exception ex)
                    {
                        return BadRequest(ex.Message);
                    }
                }

                return BadRequest();
            }
            return BadRequest("No Image Selected");

        }

        [HttpPost("uploadBingToBlob")]
        public async Task<IActionResult> uploadBingToBlob(string file, string ext)
        {
            //try
            //{
            var container = bs.GetCloudBlobContainer().Result;
            string imageName = Guid.NewGuid().ToString() + "." + ext;
            dynamic Response = new ExpandoObject();
            Response.ImageUrl = bs.UploadImage_URL(file, imageName, container).Result;
            Response.ThumbnailUrl = Response.ImageUrl; // bs.UploadThumbnail_URL(file, imageName, container).Result;

            return Ok(Response);
            //}
            //catch (Exception ex)
            //{
            //    throw ex;
            //}
            //return BadRequest("No Image Selected");
        }

        [HttpPost("uploadURLToBlob")]
        public async Task<IActionResult> uploadURLToBlob(string userId, string file, string ext)
        {
            dynamic Response;
            //try
            //{
            try
            {                   
                    Uri uri = new Uri(file);
                    if (uri.Host.Contains("rpgsmithsa.blob.core.windows.net"))
                    {
                        Response = new ExpandoObject();
                        Response.ImageUrl = file;
                        Response.ThumbnailUrl = file;
                        return Ok(Response);
                    }                
            }
            catch (Exception ex) { }          

            var container = bs.GetCloudBlobContainer("user-" + userId).Result;
            string imageName = Guid.NewGuid().ToString() + "." + ext;
            Response = new ExpandoObject();
            Response.ImageUrl = bs.UploadImage_URL(file, imageName, container).Result;
            Response.ThumbnailUrl = Response.ImageUrl; // bs.UploadThumbnail_URL(file, imageName, container).Result;

            return Ok(Response);

            //}
            //catch (Exception ex)
            //{
            //    throw ex;
            //}
            //return BadRequest("No Image Selected");
        }

        [HttpPost("uploadImageToBlob")]
        public async Task<IActionResult> uploadImageToBlob([FromBody] ImageViewModel model)
        {
            dynamic Response;
           
            try
            {
                Uri uri = new Uri(model.File);
                if (uri.Host.Contains("rpgsmithsa.blob.core.windows.net"))
                {
                    Response = new ExpandoObject();
                    Response.ImageUrl = model.File;
                    Response.ThumbnailUrl = model.File;
                    return Ok(Response);
                }
            }
            catch (Exception ex) { }

            var container = bs.GetCloudBlobContainer("user-" + model.UserId).Result;
            string imageName = Guid.NewGuid().ToString() + ".jpg";
            Response = new ExpandoObject();
            if (model.Type == "base64")
                Response.ImageUrl = bs.UploadImage_Base64(model.File, imageName, container).Result;
            else if(model.Type == "url")
                Response.ImageUrl = bs.UploadImage_URL(model.File, imageName, container).Result; 
            //Response.ThumbnailUrl = Response.ImageUrl; // bs.UploadThumbnail_URL(file, imageName, container).Result;

            return Ok(Response);
        }

        [HttpGet("BlobGetDefaultImage")]
        public async Task<IActionResult> BlobGetDefaultImage(string type = "")
        {
            try
            {
                dynamic Response = new ExpandoObject();
                Response.imageUrl = bs.GetDefaultImage(type);
                return Ok(Response);
            }
            catch (Exception ex)
            {
            }
            return BadRequest("No Image Selected");
        }
        [HttpGet("BlobGetDefaultImageList")]
        public async Task<IActionResult> BlobGetDefaultImageList(string type = "")
        {
            try
            {
                
                List<string> result=await bs.BlobGetDefaultImageList(type);
                return Ok(result);
            }
            catch (Exception ex)
            {
            }
            return BadRequest("No Image Selected");
        }

        [HttpGet("ConvertImageURLToBase64")]
        public string ConvertImageURLToBase64(string url)
        {
            if (url.Contains("rpgsmithsa.blob.core.windows.net"))
            {
                url = url.Replace("?", "%3f").Replace("&", "%26");
            }
            
            StringBuilder _sb = new StringBuilder();

            Byte[] _byte = this.GetImage(url);
            //return _byte;
            _sb.Append(Convert.ToBase64String(_byte, 0, _byte.Length));

            return ("data:image/jpeg;base64," + _sb.ToString());
        }

        private byte[] GetImage(string url)
        {
            Stream stream = null;
            byte[] buf;

            try
            {
                WebProxy myProxy = new WebProxy();
                HttpWebRequest req = (HttpWebRequest)WebRequest.Create(url);

                HttpWebResponse response = (HttpWebResponse)req.GetResponse();
                stream = response.GetResponseStream();

                using (BinaryReader br = new BinaryReader(stream))
                {
                    int len = (int)(response.ContentLength);
                    buf = br.ReadBytes(len);
                    br.Close();
                }

                stream.Close();
                response.Close();
            }
            catch (Exception exp)
            {
                buf = null;
            }

            return (buf);
        }

        [HttpPost("uploadEditorImageByUserId")]
        public async Task<IActionResult> uploadEditorImageByUserId(string userId)
        {
            
            if (_httpContextAccessor.HttpContext.Request.Form.Files.Any())
            {
                foreach (var _httpPostedFile in _httpContextAccessor.HttpContext.Request.Form.Files)
                {

                    try
                    {
                        BlobService bs = new BlobService(_httpContextAccessor, _accountManager, _rulesetService);
                        var container = bs.GetCloudBlobContainer("user-" + userId).Result;
                        string imageName = Guid.NewGuid().ToString();
                        return Ok(bs.UploadImages(_httpPostedFile, imageName, container, userId).Result);
                    }
                    catch (Exception ex)
                    {
                        return BadRequest(ex.Message);
                    }
                }

                return BadRequest();
            }
            return BadRequest("No Image Selected");

        }

        //get user id methods
        private string GetUserId()
        {
            string userName = _httpContextAccessor.HttpContext.User.Identities.Select(x => x.Name).FirstOrDefault();
            ApplicationUser appUser = _accountManager.GetUserByUserNameAsync(userName).Result;
            return appUser.Id;
        }

        [HttpPost("DeleteBlob")]
        public async Task<IActionResult> DeleteBlob([FromBody] List<DeleteBlob> model,string prefixToGetFolderContent="")
        {
            try
            {
                await bs.DeleteBlobs(model, prefixToGetFolderContent);
                return Ok();
            }
            catch (Exception ex) {
                return BadRequest(ex.Message);
            }            
        }
        [HttpPost("UploadImages")]
        public IActionResult UploadImages(string userId)
        {
            if (_httpContextAccessor.HttpContext.Request.Form.Files.Any())
            {
                foreach (var file in _httpContextAccessor.HttpContext.Request.Form.Files)
                {
                    var httpPostedFile = file;

                    if (httpPostedFile != null)
                    {
                        try
                        {
                            BlobService bs = new BlobService(_httpContextAccessor, _accountManager, _rulesetService);
                            var container = bs.GetCloudBlobContainer("user-" + userId).Result;
                            string imageName = Guid.NewGuid().ToString();
                            dynamic Response = new ExpandoObject();
                            string img = bs.UploadImages(httpPostedFile, imageName, container).Result;


                            //return Ok();
                        }
                        catch (Exception ex)
                        {
                            return BadRequest(ex.Message);
                        }
                    }
                    else
                    {
                        return BadRequest("No file selected");
                    }
                }
                return Ok();
            }
            return BadRequest("No Image Selected");
        }
        [HttpPost("uploadhandoutByUserId")]
        public async Task<IActionResult> uploadhandoutByUserId(string userId, int campaignID = 0)
        {

            if (_httpContextAccessor.HttpContext.Request.Form.Files.Any())
            {
                // Get the uploaded image from the Files collection
                foreach (var item in _httpContextAccessor.HttpContext.Request.Form.Files)
                {
                    var httpPostedFile = item;

                    if (httpPostedFile != null)
                    {
                        try
                        {
                            BlobService bs = new BlobService(_httpContextAccessor, _accountManager, _rulesetService);
                            var container = bs.GetCloudBlobContainer("user-" + userId + "-handout" + "-" + campaignID).Result;
                            string imageName = Path.GetFileNameWithoutExtension(httpPostedFile.FileName.ToString());
                           await bs.Uploadhandout(httpPostedFile, imageName, container, userId);
                            //return Ok(new { result = bs.Uploadhandout(httpPostedFile, imageName, container, userId).Result });
                        }
                        catch (Exception ex)
                        {
                            return BadRequest(ex.Message);
                        }
                    }
                }
                return Ok(new { result = true });

                //return BadRequest();
            }
            return BadRequest("No file Selected");

        }
        
        [HttpPost("uploadhandoutFolderByUserId")]
        public async Task<IActionResult> uploadhandoutFolderByUserId(string userId,string folderName, int campaignID = 0)
        {

            if (_httpContextAccessor.HttpContext.Request.Form.Files.Any())
            {
                foreach (var item in _httpContextAccessor.HttpContext.Request.Form.Files)
                {
                    // Get the uploaded image from the Files collection
                    var httpPostedFile = item;

                    if (httpPostedFile != null)
                    {
                        try
                        {
                            BlobService bs = new BlobService(_httpContextAccessor, _accountManager, _rulesetService);
                            var container = bs.GetCloudBlobContainer("user-" + userId + "-handout" + "-" + campaignID).Result;
                            string imageName = Path.GetFileNameWithoutExtension(httpPostedFile.FileName.ToString());
                            //return Ok(new { result = bs.UploadhandoutFolder(httpPostedFile, imageName, container, userId, folderName).Result });
                            await bs.UploadhandoutFolder(httpPostedFile, imageName, container, userId, folderName);
                        }
                        catch (Exception ex)
                        {
                            return BadRequest(ex.Message);
                        }
                    }
                }
                return Ok(new { result = true });

                // return BadRequest();
            }
            else if (!string.IsNullOrEmpty(folderName))
            {
                var container = bs.GetCloudBlobContainer("user-" + userId + "-handout" + "-" + campaignID).Result;
                string imageName = "default_folder_file";
                return Ok(new { result = bs.UploadhandoutFolder(null, imageName, container, userId, folderName).Result });
            }
            return BadRequest("No file Selected");

        }
        [HttpGet("MyHandouts")]
        public async Task<IActionResult> MyHandouts(string userId, int Count = 39, int previousContainerImageNumber = 0,string prefixToGetFolderContent="",int campaignID=0)
        {
            return Ok(bs.BlobMyHandoutsAsync("user-" + userId + "-handout" + "-" + campaignID, Count, previousContainerImageNumber, prefixToGetFolderContent));
        }

        [HttpPost("RenameFile")]
        public async Task<IActionResult> RenameFile(string userId, string oldFileName, string newFileName, int campaignID = 0, string prefixToGetFolderContent = "")
        {
            try
            {
                var container = await bs.GetCloudBlobContainer("user-" + userId + "-handout" + "-" + campaignID);
                await bs.RenameFile(container, oldFileName, newFileName, prefixToGetFolderContent);
                return Ok();
            }
            catch (Exception ex) {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost("CopyMoveFile")]
        public async Task<IActionResult> CopyMoveFile(string userId, string FileNameToMove, int campaignID = 0,  string prefixToGetFolderContent = "", string FolderNameToPasteFile = "", bool isCopy = false)
        {
            try
            {
                var container = await bs.GetCloudBlobContainer("user-" + userId + "-handout" + "-" + campaignID);
                await bs.CopyMoveFile(container, FileNameToMove, FolderNameToPasteFile, prefixToGetFolderContent, isCopy);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost("DeleteFolder")]
        public async Task<IActionResult> DeleteFolder(string userId, int campaignID = 0, string prefixToGetFolderContent = "")
        {
            try
            {
                var container = await bs.GetCloudBlobContainer("user-" + userId + "-handout" + "-" + campaignID);
                await bs.DeleteFolder(container, prefixToGetFolderContent);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }        
        //[HttpGet("DownloadBlob")]
        ////[ResponseType(typeof(HttpResponseMessage))]
        //public async Task<HttpResponseMessage> DownloadBlob(string fileName, string userId, int campaignID = 0)
        //{
        //    var cloudBlobContainer = await bs.GetCloudBlobContainer("user-" + userId + "-handout" + "-" + campaignID);
        //    //CloudBlobContainer sourceContainer = cloudBlobContainer;
        //    CloudBlockBlob sourceBlob = cloudBlobContainer.GetBlockBlobReference(fileName);
        //    //var stream = await sourceBlob.OpenReadAsync();
        //    //return File(stream, sourceBlob.Properties.ContentType);

        //    HttpResponseMessage result = new HttpResponseMessage(HttpStatusCode.OK);
        //    var stream = await sourceBlob.OpenReadAsync();
        //    result.Content = new StreamContent(stream);
        //   // result.Content = new StreamContent(stream);
        //    result.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
        //    {
        //        FileName = fileName
        //    };
        //    result.Content.Headers.ContentType =  new MediaTypeHeaderValue(sourceBlob.Properties.ContentType);
        //    return result;

        //    //HttpResponseMessage result = new HttpResponseMessage(HttpStatusCode.OK);
        //    //var stream = await sourceBlob.OpenReadAsync();
        //    //using (var ms = new MemoryStream())
        //    //{
        //    //    if (await sourceBlob.ExistsAsync())
        //    //    {
        //    //        await sourceBlob.DownloadToStreamAsync(ms);
        //    //    }
        //    //    //return ms.ToArray();
        //    //    result.Content = new StreamContent(ms);
        //    //    result.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
        //    //    {
        //    //        FileName = fileName
        //    //    };
        //    //    result.Content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
        //    //    return result;
        //    //}

        //}

    }
}
