import { Account, Client, ID } from "appwrite";

const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string;
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT as string;

const client = new Client();
console.log({ endpoint, projectId });
if (endpoint && projectId) {
  client.setEndpoint(endpoint).setProject(projectId);
}
const account = new Account(client);

export { client, account, ID };
