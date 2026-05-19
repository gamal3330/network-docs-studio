import "../config/env.js";
import { prisma } from "../db/prisma.js";
import { hashPassword } from "../modules/auth/password.js";

type Args = {
  email?: string;
  password?: string;
};

function parseArgs(argv: string[]): Args {
  const args: Args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--email" || arg === "-e") {
      args.email = next;
      index += 1;
    } else if (arg === "--password" || arg === "-p") {
      args.password = next;
      index += 1;
    }
  }

  return args;
}

async function main() {
  const { email, password } = parseArgs(process.argv.slice(2));

  if (!email || !password) {
    console.error("Usage: npm run user:reset-password --workspace @nds/api -- --email user@example.com --password newpass123");
    process.exitCode = 1;
    return;
  }

  if (password.length < 6) {
    console.error("Password must be at least 6 characters.");
    process.exitCode = 1;
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, email: true, name: true }
  });

  if (!user) {
    console.error(`User not found: ${normalizedEmail}`);
    process.exitCode = 1;
    return;
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash }
  });

  console.log(`Password reset successfully for ${user.email} (${user.name}).`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
