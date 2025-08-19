import { Router } from "express";
import roomController from '@controllers/user/chat_room';
import { check_access, checkRole, verifyAuthToken } from "@utils/authValidator";
import { checkFileSize, upload } from "@utils/multer";
import { schemaValidator } from "@utils/schemaValidator";
import { add_remove_participantsSchema, create_room_with_groupSchema, create_roomSchema, edit_groupSchema } from "@validators/user/add";

const route = Router();
const p = {
    createRoom: '/createRoom',
    createRoom_with_group: '/createRoom_with_group',
    update_group_profile: '/update_group_profile',
    room_details: '/room_details/:id',
    add_participants: '/add_participants',
    remove_participants: '/remove_participants',
    delete_msg: '/delete_msg/:id',
    check_participant_status: '/check_participant_status/:id'
};

route.post(p.createRoom, verifyAuthToken, checkRole(['user']), check_access([0, 1]), schemaValidator(create_roomSchema), roomController.createRoom);
route.post(p.createRoom_with_group, verifyAuthToken, checkRole(['user']), check_access([0, 1]), upload.fields([{ name: 'image', maxCount: 1 }]), checkFileSize, schemaValidator(create_room_with_groupSchema), roomController.createRoom_with_group);
route.put(p.update_group_profile, verifyAuthToken, checkRole(['user']), check_access([0, 1]), upload.fields([{ name: 'image', maxCount: 1 }]), checkFileSize, schemaValidator(edit_groupSchema), roomController.update_group_profile);
route.get(p.room_details, verifyAuthToken, checkRole(['user']), check_access([0, 1]), roomController.room_details);
route.put(p.add_participants, verifyAuthToken, checkRole(['user']), check_access([0, 1]), schemaValidator(add_remove_participantsSchema), roomController.add_participants);
route.put(p.remove_participants, verifyAuthToken, checkRole(['user']), check_access([0, 1]), schemaValidator(add_remove_participantsSchema), roomController.remove_participants);
route.delete(p.delete_msg, verifyAuthToken, checkRole(['user']), check_access([0, 1]), roomController.delete_msg);
route.get(p.check_participant_status, verifyAuthToken, checkRole(['user']), check_access([0, 1]), roomController.check_participant_status);

export default route;