using EFCore.BulkExtensions;
using Microsoft.EntityFrameworkCore;
using System.Linq.Dynamic.Core;

namespace WorldCitiesAPI.Data
{
    public class ApiResult<T>
    {
        private ApiResult(List<T> data, 
            int count, 
            int pageIndex, 
            int pageSize,
            string? sortColumn,
            string? sortOrder,
            string? filterColumn,
            string? filterQuery)
        {
            Data = data;
            PageIndex = pageIndex;
            PageSize = pageSize;
            SortColumn = sortColumn;
            SortOrder = sortOrder;
            FilterColumn = filterColumn;
            FilterQuery = filterQuery;
            TotalCount = count;
            TotalPages = (int)Math.Ceiling(count / (double)pageSize);
        }

        public List<T> Data { get; }
        public int TotalCount { get; }
        public int TotalPages { get; }
        public int PageIndex { get; }
        public int PageSize { get; }
        public string? SortColumn { get; set; }
        public string? SortOrder { get; set; }
        public string? FilterColumn { get; set; }
        public string? FilterQuery { get; set;}

        public bool HasPreviousPage => PageIndex > 0;
        public bool HasNextPage => (PageIndex + 1) < TotalPages;

        public static async Task<ApiResult<T>> CreateAsync(IQueryable<T> source, 
            int pageIndex, 
            int pageSize, 
            string? sortColumn = null, 
            string? sortOrder=null,
            string? filterColumn = null,
            string? filterQuery = null)
        {
            if(!string.IsNullOrEmpty(filterColumn) && !string.IsNullOrEmpty(filterQuery) && IsValidProperty(filterColumn))
            {
                source = source.Where(
                    string.Format("{0}.StartsWith(@0)", filterColumn),
                    filterQuery);
            }
            var count = await source.CountAsync();

            if(!string.IsNullOrEmpty(sortColumn) && IsValidProperty(sortColumn))
            {
                sortOrder = !string.IsNullOrEmpty(sortOrder) && sortOrder.ToUpper() == "ASC"
                    ? "ASC"
                    : "DESC";

                source = source.OrderBy(string.Format("{0} {1}", sortColumn, sortOrder));
            }
            source = source.Skip(pageIndex*pageSize).Take(pageSize);

            var sql = source.ToParametrizedSql();

            var data = await source.ToListAsync();

            return new ApiResult<T>(data, count, pageIndex, pageSize, sortColumn, sortOrder, filterColumn, filterQuery);
        }

        public static bool IsValidProperty(string propertyName, bool throwExcptionIfNotFound = true)
        {
            var prop = typeof(T).GetProperty(
                propertyName,
                System.Reflection.BindingFlags.IgnoreCase
                | System.Reflection.BindingFlags.Public
                | System.Reflection.BindingFlags.Instance);

            if (prop == null && throwExcptionIfNotFound)
                throw new NotSupportedException(string.Format($"ERROR: Property '{propertyName}' does not exist."));

            return prop != null;
        }
    }
}
