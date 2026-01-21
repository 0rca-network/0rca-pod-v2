"use server"

import { App } from 'octokit';

const GITHUB_APP_ID = process.env.GITHUB_APP_ID || '';
const GITHUB_PRIVATE_KEY = process.env.GITHUB_PRIVATE_KEY?.replace(/\\n/g, '\n') || '';

const githubApp = new App({
    appId: GITHUB_APP_ID,
    privateKey: GITHUB_PRIVATE_KEY,
});

export async function listAvailableRepos() {
    try {
        console.log(`[GitHub-Actions] Listing installations for App: ${GITHUB_APP_ID}`);

        // 1. Get all installations of the app
        const installations = await githubApp.octokit.request("GET /app/installations");

        const allRepos: any[] = [];

        // 2. For each installation, list repositories
        for (const installation of installations.data) {
            const installationOctokit = await githubApp.getInstallationOctokit(installation.id);
            const repos = await installationOctokit.request("GET /installation/repositories", {
                sort: 'pushed',
                direction: 'desc',
                per_page: 100
            });

            repos.data.repositories.forEach((repo: any) => {
                allRepos.push({
                    id: repo.id,
                    name: repo.name,
                    full_name: repo.full_name,
                    description: repo.description,
                    owner: repo.owner.login,
                    html_url: repo.html_url,
                    clone_url: repo.clone_url,
                    updated_at: repo.updated_at,
                    pushed_at: repo.pushed_at,
                    installation_id: installation.id
                });
            });
        }

        return { success: true, repos: allRepos };

    } catch (error: any) {
        console.error("[GitHub-Actions] Failure listing repos:", error.message);
        return { success: false, error: error.message };
    }
}

export async function getRepoContents(owner: string, repo: string, path: string = "") {
    try {
        const { data: installation } = await githubApp.octokit.request("GET /repos/{owner}/{repo}/installation", {
            owner,
            repo,
        });
        const installationOctokit = await githubApp.getInstallationOctokit(installation.id);

        const contents = await installationOctokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
            owner,
            repo,
            path
        });

        return { success: true, contents: contents.data };
    } catch (error: any) {
        console.error("[GitHub-Actions] Failure getting contents:", error.message);
        return { success: false, error: error.message };
    }
}

export async function getFileContent(owner: string, repo: string, path: string) {
    try {
        const { data: installation } = await githubApp.octokit.request("GET /repos/{owner}/{repo}/installation", {
            owner,
            repo,
        });
        const installationOctokit = await githubApp.getInstallationOctokit(installation.id);

        const response = await installationOctokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
            owner,
            repo,
            path
        });

        // Content is base64 encoded
        const content = Buffer.from((response.data as any).content, 'base64').toString('utf-8');

        return { success: true, content };
    } catch (error: any) {
        console.error("[GitHub-Actions] Failure getting file content:", error.message);
        return { success: false, error: error.message };
    }
}
