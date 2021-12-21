const router = require("express").Router();
const userController = require("../controllers/userController");

router.patch('/:username/follow',userController.followUser)
router.patch('/:username/unfollow',userController.unfollowUser)
router.get('/:username',userController.getUser)
router.patch('/:username',userController.updateUser)


module.exports = router;