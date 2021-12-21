const router = require("express").Router();
const postController = require("../controllers/postController");

router.get('/',postController.getAllPosts)
router.post('/',postController.newPost)

router.get('/:id',postController.getPostById)
router.patch('/:id',postController.updatePost)
router.delete('/:id',postController.deletePost)

module.exports = router;