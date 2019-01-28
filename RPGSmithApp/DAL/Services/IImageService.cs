using DAL.Models.APIModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
    public interface IImageService
    {
        Task<BingApiResponse> BingImageSearchAsync(string query);
    }
}
