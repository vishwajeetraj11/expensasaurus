import { Account, Client, Databases, ID, Permission, Storage } from "appwrite";

const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string;
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT as string;

const client = new Client();

if (endpoint && projectId) {
  client.setEndpoint(endpoint).setProject(projectId);
}

const account = new Account(client);
const database = new Databases(client);
const storage = new Storage(client);

export { client, account, ID, database, Permission, storage };
