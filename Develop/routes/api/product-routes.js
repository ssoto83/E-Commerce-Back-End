const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  // find all products
  // be sure to include its associated Category and Tag data
  try {
    const products = await Product.findAll({
      include: [{ model: Category }, {model: Tag}], // Associated product
    });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get one product
router.get('/:id', async (req, res) => {
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category }, { model: Tag }],
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});

// create new product
router.post('/', async (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  try {
    // Create the new product
    const product = await Product.create(req.body);

    // If there are product tags, create pairings in the ProductTag model
    if (Array.isArray(req.body.tagIds) && req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map(tag_id => ({
        product_id: product.id,
        tag_id,
      }));
      await ProductTag.bulkCreate(productTagIdArr);
    }

    // Respond with the created product
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to create product', details: err.message });
  }
});

// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      if (req.body.tagIds && req.body.tagIds.length) {
        
        ProductTag.findAll({
          where: { product_id: req.params.id }
        }).then((productTags) => {
          // create filtered list of new tag_ids
          const productTagIds = productTags.map(({ tag_id }) => tag_id);
          const newProductTags = req.body.tagIds
          .filter((tag_id) => !productTagIds.includes(tag_id))
          .map((tag_id) => {
            return {
              product_id: req.params.id,
              tag_id,
            };
          });

            // figure out which ones to remove
          const tagsToRemove = productTags
          .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
          .map(({ id }) => id);
                  // run both actions
          return Promise.all([
            ProductTag.destroy({ where: { id: tagsToRemove } }),
            ProductTag.bulkCreate(newProductTags),
          ]);
        });
      }

      return res.json(product);
    })
    .catch((err) => {
      // console.log(err);
      console.error(err);
      res.status(400).json({message: 'Failed to update product', error: err.message });
    });
});

router.delete('/:id', async (req, res) => {
  // delete one product by its `id` value
  try {
    const deleted = await Product.destroy({
      where: { id: req.params.id },
    });

    if (deleted) {
      res.status(204).end(); // No content to return
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    onsole.error(err); 
    res.status(500).json({ message: 'Failed to delete product', error: err.message });
  }
});

module.exports = router;
