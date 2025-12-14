import express from 'express';

import {
  acceptFriendRequest,
  declineFriendRequest,
  deleteFriend,
  getAllFriends,
  getFriendRequests,
  sendFriendRequest,
} from '../controllers/friendController.js';

const router = express.Router();

//Post method
router.post('/requests', sendFriendRequest);

router.post('/requests/:requestId/accept', acceptFriendRequest);

router.post('/requests/:requestId/decline', declineFriendRequest);

///Get method
router.get('/', getAllFriends);

router.get('/requests', getFriendRequests);

//Delete method
router.delete('/user/:friendUserId', deleteFriend);

export default router;
