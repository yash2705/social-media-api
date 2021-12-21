const router = require("express").Router();
const postController = require("../controllers/postController");

router
    .route('/')
    .get(postController.getAllPosts)
    .post(postController.newPost)

router
    .route('/:id')
    .get(postController.getPostById)
    .patch(postController.updatePost)
    .delete(postController.deletePost)

module.exports = router;