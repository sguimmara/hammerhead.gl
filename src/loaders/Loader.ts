import Mesh from "../objects/Mesh";

export default interface Loader {
    loadFromURI(uri: string): Promise<Mesh>;
}