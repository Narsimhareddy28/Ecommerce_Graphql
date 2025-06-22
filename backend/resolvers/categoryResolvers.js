import { Category } from '../models/Category.js';

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
        }

},

    Mutation:{
                addCategory: async(_,{name, description})=>{
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
     if (!context.user || !['admin', 'seller'].includes(context.user.role)) {
  throw new Error('Only admin or seller can perform this action');
}
      const category = await Category.findById(id);
      if (!category) throw new Error('Category not found');

      if (name) category.name = name;
      if (description) category.description = description;
      await category.save();

      return category;
    },

deleteCategory: async (_, { id }, context) => {
     if (!context.user || !['admin', 'seller'].includes(context.user.role)) {
  throw new Error('Only admin or seller can perform this action');
}

      const category = await Category.findById(id);
      if (!category) throw new Error('Category not found');

      await category.deleteOne();
      return true;
    },
    }
};

export default categoryResolvers;