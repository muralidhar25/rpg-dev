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
using System.Text;
using System.Threading.Tasks;

namespace RPGSmithApp.Controllers
{

    // [Authorize]
    [Route("api/[controller]")]
    public class ImageController : Controller
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAccountManager _accountManager;
        private readonly IImageService _imageService;
        private readonly BlobService bs = new BlobService();

        public ImageController(IHttpContextAccessor httpContextAccessor, IAccountManager accountManager,
            IImageService imageService)
        {
            _httpContextAccessor = httpContextAccessor;
            _accountManager = accountManager;
            _imageService = imageService;
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
            return Ok(bs.GetSpaceUsed("user-" + userId));
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
                        BlobService bs = new BlobService();
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
        public async Task<IActionResult> uploadByUserId(string userId)
        {

            if (_httpContextAccessor.HttpContext.Request.Form.Files.Any())
            {
                // Get the uploaded image from the Files collection
                var httpPostedFile = _httpContextAccessor.HttpContext.Request.Form.Files["UploadedImage"];

                if (httpPostedFile != null)
                {
                    try
                    {
                        BlobService bs = new BlobService();
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
                        BlobService bs = new BlobService();
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

        [HttpGet("ConvertImageURLToBase64")]
        public string ConvertImageURLToBase64(string url)
        {
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
                        BlobService bs = new BlobService();
                        var container = bs.GetCloudBlobContainer("user-" + userId).Result;
                        string imageName = Guid.NewGuid().ToString();
                        return Ok(bs.UploadImages(_httpPostedFile, imageName, container).Result);
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
        public  IActionResult DeleteBlob([FromBody] List<DeleteBlob> model)
        {
            try
            {
                bs.DeleteBlobs(model);
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
                            BlobService bs = new BlobService();
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
        
    }
}
