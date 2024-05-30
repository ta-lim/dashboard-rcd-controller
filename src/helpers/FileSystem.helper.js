import FS from 'fs-extra';
import { fileTypeFromBuffer } from 'file-type';

class FileSystemHelper {
  constructor(server) {
    this.server = server;
  }

  async readFile(path) {
    const file = FS.readFileSync(process.cwd() + path);
    const { mime } = await fileTypeFromBuffer(file);

    return {
      file, mime
    };
  }
}

export default FileSystemHelper