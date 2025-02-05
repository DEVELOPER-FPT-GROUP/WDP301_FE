import { RequestResponse } from "./RequestResponse";

export default class FailureResponse extends RequestResponse {
	code: string;
	message: string;
	success: boolean;

	constructor(args: { code: string; message: string; success: boolean }) {
		super(202); // Assuming status 202 for failure
		this.code = args.code;
		this.message = args.message;
		this.success = args.success;
	}
}
