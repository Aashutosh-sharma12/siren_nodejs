import { model, Schema } from "mongoose"

interface appVersion {
    androidVersion:string;
    iosVersion:string;
    androidUpdate_Type:string;
    iosUpdate_Type:string;  
    isDelete: boolean;
    isActive: boolean
}

const appVersionSchema = new Schema<appVersion>({
    androidVersion:{type:String, default:"1"},
    iosVersion:{type:String, default:"1"},
    androidUpdate_Type:{type:String, default:"Force", enum:["Force", "Normal"] },
    iosUpdate_Type:{type:String, default:"Force", enum:["Force", "Normal"]},
}, {
    timestamps: true,
    versionKey: false
});

const appVersionModal = model<appVersion>('appVersion', appVersionSchema);
export default appVersionModal;