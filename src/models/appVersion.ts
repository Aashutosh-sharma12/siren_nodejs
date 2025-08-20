import { model, Schema } from "mongoose"

interface appVersion {
    androidVersion:number;
    iosVersion:number;
    androidUpdate_Type:string;
    iosUpdate_Type:string;  
    isDelete: boolean;
    isActive: boolean
}

const appVersionSchema = new Schema<appVersion>({
    androidVersion:{type:Number, default:1},
    iosVersion:{type:Number, default:1},
    androidUpdate_Type:{type:String, default:"Force", enum:["Force", "Normal"] },
    iosUpdate_Type:{type:String, default:"Force", enum:["Force", "Normal"]},
}, {
    timestamps: true,
    versionKey: false
});

const appVersionModal = model<appVersion>('appVersion', appVersionSchema);
export default appVersionModal;