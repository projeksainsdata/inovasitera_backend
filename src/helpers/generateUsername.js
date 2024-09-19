const generateUsername = async (email) => {
  // LIKE DISCORD LOGIC TO GENERATE USERNAME
  // USERNAME#XXXX
  // USERNAME#0001
  // USERNAME#0002

  // get username from email
  const username = email.split('@')[0];

  const random = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(5, '0');

  return `${username}#${random}`;
};

export default generateUsername;
