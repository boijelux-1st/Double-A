import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";
import { verifyAdminToken } from "@/lib/auth"; // <-- Updated import

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!verifyAdminToken(authHeader)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const account = await db.getBankAccountById(params.id);
    if (!account) {
      return NextResponse.json({ message: "Bank account not found" }, { status: 404 });
    }

    const updatedAccount = await db.updateBankAccount(params.id, {
      isActive: !account.isActive,
    });

    return NextResponse.json({
      message: `Bank account ${updatedAccount?.isActive ? "activated" : "deactivated"} successfully`,
      account: updatedAccount,
    });
  } catch (error) {
    console.error("Error toggling bank account status:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
