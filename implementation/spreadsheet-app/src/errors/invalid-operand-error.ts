export default class InvalidOperandError extends Error {
    public constructor () {
        super();
        Object.setPrototypeOf(this, InvalidOperandError.prototype);
        this.name = this.constructor.name;
    }
    public toString() : string {
        throw new Error("Method not implemented.");
    }
}