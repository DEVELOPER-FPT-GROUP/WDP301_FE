import { RequestResponse } from "./RequestResponse";

export default class InvalidModelStateResponse extends RequestResponse {
	code: string;
	message: string[];
	success: boolean;

	constructor(args: { code: string; message: string[]; success: boolean }) {
		super(400); // Assuming status 400 for validation errors
		this.code = args.code;
		this.message = args.message;
		this.success = args.success;
	}
}
