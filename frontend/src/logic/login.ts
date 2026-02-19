import {CredentialResponse} from "@react-oauth/google";

export const login = async (body: CredentialResponse) => {
	const url = "/api/users/login";
	try {
		console.log(JSON.stringify(body));
		const response = await fetch(url, {
			method: "POST",
			body: JSON.stringify(body),
			headers: {
				"Content-Type": "application/json"
			}
		});
		if (!response.ok) {
			throw new Error(
				`Response status: ${response.status} - Response Body: ${response.body}`
			);
		}
		const result = await response.json();
		console.log(result);
	} catch (error) {
		console.error(error);
	}
};
