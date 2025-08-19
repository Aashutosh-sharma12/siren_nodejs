import { Router } from "express";
import homeController from '@controllers/user/home';
import { check_access, checkRole, verifyAuthToken } from "@utils/authValidator";

const route = Router();
const p = {
    contactList: '/contactList',
    all_room_list: '/all_room_list',
    all_room_list1: '/all_room_list1',
    chatList: '/chatList/:id',
    feed_list: '/feed_list'
};

route.get(p.contactList, verifyAuthToken, checkRole(['user']), check_access([0, 1]), homeController.contactList);
route.get(p.all_room_list, verifyAuthToken, checkRole(['user']), check_access([0, 1]), homeController.all_room_list);
route.get(p.all_room_list1, verifyAuthToken, checkRole(['user']), check_access([0, 1]), homeController.all_room_list1);
route.get(p.chatList, verifyAuthToken, checkRole(['user']), check_access([0, 1]), homeController.chatList);
route.get(p.feed_list, verifyAuthToken, checkRole(['user']), homeController.feed_list);
export default route;