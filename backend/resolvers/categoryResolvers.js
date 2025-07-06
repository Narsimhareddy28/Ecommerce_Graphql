import { Category } from '../models/Category.js';
import { Product } from '../models/Products.js';

const categoryResolvers = {
    Query: {
        getAllCategories: async () => {
            return await Category.find();
        },

        getCategory: async (_, { id }) => {
            console.log(id);
            const category = await Category.findById(id);
            console.log(category);
            if (!category) {
                throw new Error('Category not found');
            }
            return category;
        },

        getCategoriesBySeller: async (_, __, context) => {
            if (!context.user || context.user.role !== 'seller') {
                throw new Error('Only sellers can view their categories');
            }
            
            // Get all products by this seller
            const sellerProducts = await Product.find({ sellerId: context.user.id });
            
            // Get unique category IDs from seller's products
            const categoryIds = [...new Set(sellerProducts.map(product => product.category))];
            
            // Get categories that are used by seller's products
            const categories = await Category.find({ _id: { $in: categoryIds } });
            
            return categories;
        }

},

    Mutation:{
                addCategory: async(_,{name, description}, context)=>{
                    console.log('AddCategory context:', context.user);
                    if (!context.user || context.user.role !== 'admin') {
                        throw new Error('Only admin can create categories');
                    }
                    if (!name){
                        throw new Error('Name is required');
                    }
                    const existingCategory = await Category.findOne({ name });
                    if (existingCategory) {
                        throw new Error('Category already exists');
                    }
                    const category = await Category.create({ name, description });
                    return category;
                },
       updateCategory: async (_, { id, name, description }, context) => {
     if (!context.user || context.user.role !== 'admin') {
  throw new Error('Only admin can update categories');
}
      const category = await Category.findById(id);
      if (!category) throw new Error('Category not found');

      if (name) category.name = name;
      if (description) category.description = description;
      await category.save();

      return category;
    },

deleteCategory: async (_, { id }, context) => {
     if (!context.user || context.user.role !== 'admin') {
  throw new Error('Only admin can delete categories');
}

      const category = await Category.findById(id);
      if (!category) throw new Error('Category not found');

      await category.deleteOne();
      return true;
    },
    }
};

export default categoryResolvers;