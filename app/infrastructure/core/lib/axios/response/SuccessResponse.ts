import { RequestResponse } from "./RequestResponse";
export default class SuccessResponse extends RequestResponse {
	message: string;
	data: any;
	success: boolean;

	constructor(message: string, data: any) {
		super(200); // Assuming status 200 for success
		this.message = message;
		this.data = data;
		this.success = true;
	}
}
