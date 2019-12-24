const axios = require('axios');

async function* getMediaUntil(initUrl, stopCondition) {
  let isDone = false;
  let url = initUrl;

  while (!isDone) {
    const { data } = await axios.get(url);
    yield data.data;
    if (stopCondition(data)) {
      isDone = true;
    } else {
      url = data.pagination.next_url;
    }
  }
}

async function getAllUserPosts(accessToken) {
  let media = [];
  const url = `https://api.instagram.com/v1/users/self/media/recent/?access_token=${accessToken}`;

  const stopCondition = ({ pagination }) => pagination.next_url === undefined;

  for await (const posts of getMediaUntil(url, stopCondition)) {
    media.push(...posts);
  }
  return media;
}

function retrieveImagesFromPost(post) {
  if (post.type === 'image') {
    return [post];
  }
  if (post.type === 'carousel') {
    return post['carousel_media']
      .filter(isEligibleMedia)
      .map(media => ({
        ...media,
        id: post['id'],
        'created_time': post['created_time']
      }))
  }
}

function normalizeDTO(imagePayload) {
  return {
    postId: imagePayload.id,
    imageUrl: imagePayload.images['standard_resolution'].url,
    postedAt: imagePayload['created_time']
  };
}

function isEligibleMedia(media) {
  return media.type === 'image' || media.type === 'carousel';
}

async function getUserAllImage(accessToken) {
  const posts = await getAllUserPosts(accessToken);
  const eligiblePosts = posts.filter(isEligibleMedia);

  return eligiblePosts.reduce((acc, post) => {
    const images = retrieveImagesFromPost(post).map(normalizeDTO)
    acc.push(...images);
    return acc;
  }, []);
}

module.exports = {
  getUserAllImage
};
