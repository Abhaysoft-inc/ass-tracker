import bcrypt from 'bcrypt'

export async function hashPassword(password: any) {
    const hashedPassword = await bcrypt.hash(password, 5);
    return hashedPassword;
}

export default hashPassword;