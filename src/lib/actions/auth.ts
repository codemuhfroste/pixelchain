"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  createAdminSession,
  createMemberSession,
  destroyAdminSession,
  destroyMemberSession,
} from "@/lib/auth/session";

export type FormState = { error?: string };

export async function adminLoginAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
    return { error: "Incorrect email or password." };
  }

  await createAdminSession(admin.id);
  redirect("/admin/orders");
}

export async function adminLogoutAction() {
  await destroyAdminSession();
  redirect("/admin/login");
}

export async function memberRegisterAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const type = formData.get("type") === "organization" ? "organization" : "individual";
  const orgName = String(formData.get("orgName") ?? "").trim();
  const contactHandle = String(formData.get("contactHandle") ?? "").trim();

  if (!name || !email || !password) {
    return { error: "Name, email, and password are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (type === "organization" && !orgName) {
    return { error: "Organization name is required for an organization account." };
  }

  const existing = await prisma.customer.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with that email already exists — try logging in." };
  }

  const passwordHash = await hashPassword(password);
  const customer = await prisma.customer.create({
    data: {
      name,
      email,
      passwordHash,
      type,
      orgName: type === "organization" ? orgName : null,
      contactHandle: contactHandle || null,
    },
  });

  await createMemberSession(customer.id);
  redirect("/account");
}

export async function memberLoginAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const customer = await prisma.customer.findUnique({ where: { email } });
  if (!customer?.passwordHash || !(await verifyPassword(password, customer.passwordHash))) {
    return { error: "Incorrect email or password." };
  }

  await createMemberSession(customer.id);
  redirect("/account");
}

export async function memberLogoutAction() {
  await destroyMemberSession();
  redirect("/login");
}
