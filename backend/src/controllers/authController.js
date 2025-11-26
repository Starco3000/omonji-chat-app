import bcrypt from 'bcrypt';

export const signUp = async (req, res) => {
  try {
    const { username, password, email, firstName, lastName } = req.body;

    //Check if one of these things are empty
    if (!username || !password || !email || !firstName || !lastName) {
      return res.status(400).json({
        message:
          'The username, password, email, firstName and lastName cannot be empty',
      });
    }

    //Check if username is exist
    const duplicate = await User.findOne({ username });
    if (duplicate) {
      return res.status(400).json({ message: 'username already exists' });
    }

    //Encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10); //salt = 10

    //Create new User
    await User.create({
      username,
      hashedPassword,
      email,
      displayName: `${firstName} ${lastName}`,
    });

    //Return result
    return req.sendStatus(204);
  } catch (error) {
    console.error(`Error when call signUp`, error);
    return res.status(500).json({ message: 'System error' });
  }
};
