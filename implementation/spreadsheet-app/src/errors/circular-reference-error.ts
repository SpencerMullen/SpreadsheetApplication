export default class CircularReferenceError extends Error{
    public constructor(){
        super();
        Object.setPrototypeOf(this, CircularReferenceError.prototype);
        this.name = this.constructor.name;
    }
    public toString() : string {
        throw new Error("Method not implemented.");
    }
}