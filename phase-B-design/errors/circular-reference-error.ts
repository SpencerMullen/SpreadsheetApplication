import IError from "../interfaces/ierror.interface";

export default class CircularReferenceError implements IError{
    public toString() : string {
        throw new Error("Method not implemented.");
    }
}