import bcrypt from "bcrypt";

//Hash Password
export const HashPassword = async (password) => {
  try {
    const saltRounds = 10;
    const HashedPassword = await bcrypt.hash(password, saltRounds);
    return HashedPassword;
  } catch (error) {
    console.log(error);
  }
};

//commpare password

export const ComparePassword = async (password, HashedPassword) => {
  return bcrypt.compare(password, HashedPassword);
};
