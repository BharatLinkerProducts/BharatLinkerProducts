// apiFeature.js

class ApiFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    // Method to filter products
    filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);

        // Price filtering
        if (queryObj.price) {
            const priceRange = queryObj.price.split('-').map(Number);
            this.query = this.query.find({ price: { $gte: priceRange[0], $lte: priceRange[1] } });
            delete queryObj.price; // Remove price from queryObj
        }

        // Category filtering
        if (queryObj.category) {
            this.query = this.query.find({ category: queryObj.category });
            delete queryObj.category; // Remove category from queryObj
        }

        // Brand filtering
        if (queryObj.brand) {
            this.query = this.query.find({ brand: { $in: queryObj.brand.split(',') } });
            delete queryObj.brand; // Remove brand from queryObj
        }

        // Search filtering
        if (queryObj.search) {
            const regex = new RegExp(queryObj.search, 'i'); // Case insensitive search
            this.query = this.query.find({ title: { $regex: regex } });
            delete queryObj.search; // Remove search from queryObj
        }

        return this;
    }

    // Method for pagination
    paginate(resultsPerPage) {
        const currentPage = Number(this.queryString.page) || 1;
        const skip = resultsPerPage * (currentPage - 1);
        
        this.query = this.query.limit(resultsPerPage).skip(skip);
        return this;
    }
}

export{ApiFeatures};
