import IError from "../interfaces/ierror.interface";

export default class DivisionByZeroError implements IError{
    public toString() : string {
        throw new Error("Method not implemented");
    }
}