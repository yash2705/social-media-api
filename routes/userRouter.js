const router = require("express").Router();
const userController = require("../controllers/userController");

router.get('/:username/followers',userController.getUserFollowers)
router.get('/:username/followings',userController.getUserFollowings)
router.patch('/:username/follow',userController.followUser)
router.patch('/:username/unfollow',userController.unfollowUser)
router.get('/:username',userController.getUser)
router.patch('/:username',userController.updateUser)


module.exports = router;