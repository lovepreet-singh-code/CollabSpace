import * as Y from "yjs";
import { DocumentModel } from "../models/document.model";

export const loadState = async (docName: string): Promise<Uint8Array | null> => {
    const doc = await DocumentModel.findById(docName);
    if (!doc) return null;
    return new Uint8Array(doc.data);
};

export const saveState = async (docName: string, state: Uint8Array) => {
    await DocumentModel.findByIdAndUpdate(
        docName,
        { data: Buffer.from(state) },
        { upsert: true, new: true }
    );
};

export const applyStoredStateToYDoc = (doc: Y.Doc, state: Uint8Array) => {
    Y.applyUpdate(doc, state);
};
