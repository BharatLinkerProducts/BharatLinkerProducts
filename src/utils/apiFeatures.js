class ApiFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    search() {
        const keyword = this.queryStr.keyword ? this.queryStr.keyword.trim() : '';
        if (keyword) {
            const regex = new RegExp(keyword, 'i');
            this.query = this.query.find({
                $or: [
                    { title: { $regex: regex } },
                    { description: { $regex: regex } },
                    { category: { $elemMatch: { $regex: regex } } },
                    { brand: { $regex: regex } },
                    { keyWords: { $elemMatch: { $regex: regex } } }
                ]
            });
        }
        return this;
    }

    filterByPincode() {
        const pincode = this.queryStr.pincode;
        if (pincode) {
            const pincodeArray = pincode.split(',').map(pin => Number(pin.trim())); // Convert to numbers
            console.log(pincodeArray); // Debugging: Ensure they are numbers
            this.query = this.query.find({ pinCodes: { $in: pincodeArray } });  // Match any of the pincodeArray
        }
        return this;
    }
    

    filterByCategory() {
        const categories = this.queryStr.categories;
        if (categories) {
            const categoryArray = categories.split(',').map(category => category.trim());
            this.query = this.query.find({
                category: { 
                    $in: categoryArray // Matches any of the values in categoryArray
                }
            });
        }
        return this;
    }
    

    filterByBrand() {
        const brands = this.queryStr.brand;
        if (brands) {
            const brandArray = brands.split(',').map(brand => brand.trim());
            this.query = this.query.find({ brand: { $in: brandArray } });
        }
        return this;
    }

    filterByShop() {
        const shopId = this.queryStr.shopid;
        if (shopId) {
            this.query = this.query.find({ shop: shopId });
        }
        return this;
    }

    sortByPrice() {
        if (this.queryStr.sort) {
            const sortBy = this.queryStr.sort.toLowerCase();
            if (sortBy === 'price_low_to_high') {
                this.query = this.query.sort({ price: 1 }); // Sort by price in ascending order
            } else if (sortBy === 'price_high_to_low') {
                this.query = this.query.sort({ price: -1 }); // Sort by price in descending order
            }
        }
        return this;
    }

    pagination(resultPerPage) {
        const currentPage = parseInt(this.queryStr.page, 10) || 1;
        const skip = (currentPage - 1) * resultPerPage;

        this.query = this.query.skip(skip).limit(resultPerPage);
        return this;
    }

    filter() {
        const queryCopy = { ...this.queryStr };
        const removeFields = ["keyword", "page", "limit", "pincode", "category", "shopid", "brands", "sort"];
        removeFields.forEach((key) => delete queryCopy[key]);

        for (const key in queryCopy) {
            if (!isNaN(parseInt(queryCopy[key]))) {
                queryCopy[key] = parseInt(queryCopy[key]);
            }
        }

        if (Object.keys(queryCopy).length) {
            this.query = this.query.find(queryCopy);
        }
        return this;
    }

    getFilter() {
        return this.query.getFilter();  // Access the filter conditions for countDocuments
    }
}

export { ApiFeatures };
