import cloudinary from 'cloudinary';

export const handleUploadFile = async (
  file: File,
  folder: string,
  transformation: cloudinary.UploadApiOptions
) => {
  'use server';
  return new Promise(async (resolve, reject) => {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // @ts-ignore
    cloudinary.config({
      cloud_name: 'dbfzwztfa',
      api_key: '394432137632877',
      api_secret: 'ZPJsXm_AOAhXFT83Z5RrapDL4rU',
    });

    cloudinary.v2.uploader
      .upload_stream(
        {
          resource_type: 'image',
          format: 'webp',
          folder,
          ...transformation,
        },
        (error, result) => {
          if (error) {
            // console.log("Error in cloudinary.uploader.upload_stream\n", error);
            reject(error); // Rechazar la promesa con el error
          }
          if (result) {
            // console.log('Cloudinary url', result);
            resolve(result); // Resolver la promesa con la URL resultante
          }
        }
      )
      .end(buffer);
  });
};
