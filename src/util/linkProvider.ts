import { CancellationToken, DocumentLink, DocumentLinkProvider, ProviderResult, Range, TextDocument, Uri, window, workspace } from "vscode";
import { join, resolve } from "node:path";

import { AnchorEngine } from "../anchorEngine";
import { flattenAnchors } from "./flattener";
import { existsSync, lstatSync } from "node:fs";

const LINK_REGEX = /^(\.{1,2}[/\\])?([^#:]+)?(:\d+|#[^\s#:]+)?$/;

export class LinkProvider implements DocumentLinkProvider {
	
    public readonly engine: AnchorEngine;

    public constructor(engine: AnchorEngine) {
        this.engine = engine;
    }

    public createTarget(uri: Uri, line: number): Uri {
        return Uri.parse(`file://${uri.path}#${line}`);
    }

    public provideDocumentLinks(document: TextDocument, _token: CancellationToken): ProviderResult<DocumentLink[]> {
        if (document.uri.scheme == "output") {
            return [];
        }

        const index = this.engine.anchorMaps.get(document.uri);
        const list: DocumentLink[] = [];

        if (!index) {
            return [];
        }

        const flattened = flattenAnchors(index.anchorTree);
        const basePath = join(document.uri.fsPath, "..");
        const workspacePath = workspace.getWorkspaceFolder(document.uri)?.uri?.fsPath ?? "";
        const tasks: Promise<unknown>[] = [];

        const flattenedLinks = flattened
            .filter((anchor) => {
                const tagId = anchor.anchorTag;
                const tag = this.engine.tags.get(tagId);

                return tag?.behavior == "link" || tag?.behavior == "links";
            });

        for (const anchor of flattenedLinks) {
            const tag = this.engine.tags.get(anchor.anchorTag);

            if (tag?.behavior == "links") {
                const line = document.lineAt(anchor.lineNumber - 1);
                const anchorColumn = document.positionAt(anchor.startIndex).character;
                const commentStart = line.text.indexOf(anchor.anchorText, anchorColumn);

                if (commentStart < 0) {
                    continue;
                }

                const lineOffset = document.offsetAt(line.range.start);
                let partStart = 0;
                for (const part of anchor.anchorText.split(/[|｜]/)) {
                    const targetId = part.trim();
                    const target = flattened.find((candidate) => AnchorEngine.hasAnchorId(candidate.attributes, targetId));

                    if (targetId && target) {
                        const tokenOffset = part.indexOf(targetId);
                        const start = document.positionAt(lineOffset + commentStart + partStart + tokenOffset);
                        const end = document.positionAt(lineOffset + commentStart + partStart + tokenOffset + targetId.length);
                        const docLink = new DocumentLink(new Range(start, end), this.createTarget(document.uri, target.lineNumber));
                        docLink.tooltip = "Click here to go to anchor " + targetId;
                        list.push(docLink);
                    }

                    partStart += part.length + 1;
                }

                continue;
            }

            // Also accept `#id -- path`, a readable alternative to `path#id`.
            const idThenPath = /^#([^\s#]+)\s+--\s+(.+?)\s*$/.exec(anchor.anchorText);
            const components = idThenPath ? undefined : LINK_REGEX.exec(anchor.anchorText);
            if (!idThenPath && !components) {
                continue;
            }
            const parameter = idThenPath ? `#${idThenPath[1]}` : components?.[3] || '';
            let filePath = idThenPath ? idThenPath[2] : components?.[2] || document?.uri?.fsPath || '';
            let relativeFolder = components?.[1];
            if (idThenPath) {
                const relativePrefix = /^(\.{1,2}[/\\])/.exec(filePath);
                relativeFolder = relativePrefix?.[1];
                if (relativeFolder) {
                    filePath = filePath.slice(relativeFolder.length);
                }
            }
            const fullPath = relativeFolder ? resolve(basePath, relativeFolder, filePath) : resolve(workspacePath, filePath);
            const fileUri = Uri.file(fullPath);

            if (!existsSync(fullPath) || !lstatSync(fullPath).isFile()) {
                continue;
            }

            const anchorRange = anchor.getAnchorRange(document, true);
            let docLink: DocumentLink;
            let task: Promise<unknown>;

            if (parameter.startsWith(":")) {
                const lineNumber = Number.parseInt(parameter.slice(1));
                const targetURI = this.createTarget(fileUri, lineNumber);

                docLink = new DocumentLink(anchorRange, targetURI);
                docLink.tooltip = "Click here to open file at line " + (lineNumber + 1);
                task = Promise.resolve();
            } else {
                if (parameter.startsWith("#")) {
                    const targetId = parameter.slice(1);

                    task = this.engine.getAnchors(fileUri).then((anchors) => {
                        const flattened = flattenAnchors(anchors);
                        let targetLine = 0;

                        for (const otherAnchor of flattened) {
                            if (AnchorEngine.hasAnchorId(otherAnchor.attributes, targetId)) {
                                targetLine = otherAnchor.lineNumber;
                                break;
                            }
                        }

                        const targetURI = this.createTarget(fileUri, targetLine);

                        if (fileUri.path == window.activeTextEditor?.document?.uri?.path) {
                            docLink = new DocumentLink(anchorRange, targetURI);
                            docLink.tooltip = "Click here to go to anchor " + targetId;
                        } else {
                            docLink = new DocumentLink(anchorRange, targetURI);
                            docLink.tooltip = "Click here to open file at anchor " + targetId;
                        }
                    });
                } else {
                    docLink = new DocumentLink(anchorRange, fileUri);
                    docLink.tooltip = "Click here to open file";
                    task = Promise.resolve();
                }
            }

            const completion = task.then(() => {
                list.push(docLink);
            });

            tasks.push(completion);
        }

        return Promise.all(tasks).then(() => {
            return list;
        });
    }
}
