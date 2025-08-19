
import appVersionModal from "@models/appVersion";
//d
function addVersion(body: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const data1 = await appVersionModal.findOneAndUpdate({ isDelete: false }, body, { new: true });
            if (data1) {
                resolve(data1);
            } else {
                const data = await appVersionModal.create(body);
                resolve(data);
            }
        }
        catch (error) {
            reject(error);
        }
    })
}

function getAppVersion(headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const data = await appVersionModal.findOne({ isDelete: false });
            resolve(data);
        }
        catch (error) {
            reject(error);
        }
    })
}
export default {
    addVersion,
    getAppVersion
} as const;
