import moment from "moment-timezone";
import { Types } from "mongoose";

export class ObjectIdUtil {
  static matchObjectId = (fromDate: string | Date, toDate: string | Date) => {
    const startHexString = this.getHexStringFromDate(moment(fromDate).toDate());
    const endHexString = this.getHexStringFromDate(moment(toDate).toDate());

    return {
      _id: {
        $gte: new Types.ObjectId(startHexString),
        $lte: new Types.ObjectId(endHexString),
      },
    };
  };

  static getHexStringFromDate = (date: string | Date) => {
    return Math.trunc(moment(date, "YYYY-MM-DD").toDate().getTime() / 1000);
  };
}
