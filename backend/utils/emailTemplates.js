const getBaseTemplate = (content, title = "ExpenseMate") => `
  <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: auto; padding: 40px 20px; background-color: #fcfcfc;">
    <div style="background-color: #ffffff; border-radius: 24px; padding: 40px; border: 1px solid #f0f0f0; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #6366f1; font-size: 28px; font-weight: 900; letter-spacing: -1.5px; margin: 0; italic;">ExpenseMate</h2>
        <p style="color: #64748b; font-size: 10px; font-weight: 700; text-transform: uppercase; tracking: 2px; margin-top: 5px;">Smart Expense Management</p>
      </div>
      <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 30px 0;">
      
      ${content}
      
      <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 30px 0;">
      <p style="font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.6;">
        If you have any questions, reply to this email or visit our support portal.<br>
        &copy; ${new Date().getFullYear()} ExpenseMate. All rights reserved.
      </p>
    </div>
  </div>
`;

exports.invitationTemplate = (walletName, inviterName, loginUrl, randomPassword) => {
  const content = `
    <p style="font-size: 16px; color: #334155; line-height: 1.6;">Hi there,</p>
    <p style="font-size: 16px; color: #334155; line-height: 1.6;">
      <strong>${inviterName}</strong> has invited you to collaborate on the shared wallet <strong>"${walletName}"</strong>.
    </p>

    ${randomPassword ? `
      <div style="background: #f8fafc; padding: 24px; border-radius: 16px; margin: 24px 0; border: 1px solid #e2e8f0;">
        <p style="margin: 0 0 12px 0; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 1px;">Secure Access Credentials</p>
        <p style="margin: 8px 0; font-size: 14px; color: #1e293b;"><strong>Temporary Password:</strong> <code style="background: #ffffff; padding: 4px 8px; border-radius: 6px; border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold; color: #6366f1;">${randomPassword}</code></p>
      </div>
      <p style="font-size: 13px; color: #ef4444; font-weight: 700; margin-bottom: 20px;">
        &bull; You will be required to change this password immediately upon your first login.
      </p>
    ` : `
      <p style="font-size: 15px; color: #475569; line-height: 1.6;">
        Since you're already a member, you can access this cluster directly from your dashboard.
      </p>
    `}

    <div style="text-align: center; margin: 40px 0;">
      <a href="${loginUrl}" style="background-color: #6366f1; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 14px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);">
        Access Your Cluster
      </a>
    </div>
  `;
  return getBaseTemplate(content);
};

exports.activationTemplate = (userName, dashboardUrl) => {
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="background-color: #f0fdf4; color: #15803d; border-radius: 50%; width: 64px; height: 64px; line-height: 64px; font-size: 32px; margin: 0 auto 16px;">&checkmark;</div>
      <h3 style="font-size: 24px; font-weight: 900; color: #1e293b; margin: 0;">Account Activated</h3>
    </div>
    
    <p style="font-size: 16px; color: #334155; line-height: 1.6;">Hi ${userName},</p>
    <p style="font-size: 16px; color: #334155; line-height: 1.6;">
      Your permanent security key has been successfully set. Your account is now fully active and your shared wallet invitations are synchronized.
    </p>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="${dashboardUrl}" style="background-color: #6366f1; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 14px; font-weight: 700; font-size: 16px; display: inline-block;">
        Enter Dashboard
      </a>
    </div>
  `;
  return getBaseTemplate(content);
};

exports.passwordResetTemplate = (resetUrl) => {
  const content = `
    <p style="font-size: 16px; color: #334155; line-height: 1.6;">Hello,</p>
    <p style="font-size: 16px; color: #334155; line-height: 1.6;">
      We received a request to reset your password. If you didn't request this, you can safely ignore this email.
    </p>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="${resetUrl}" style="background-color: #6366f1; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 14px; font-weight: 700; font-size: 16px; display: inline-block;">
        Reset My Password
      </a>
    </div>
    
    <p style="font-size: 13px; color: #94a3b8; font-style: italic;">
      Note: This link will expire in 10 minutes.
    </p>
  `;
  return getBaseTemplate(content);
};

exports.monthlySummaryTemplate = (userName, data) => {
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h3 style="font-size: 24px; font-weight: 900; color: #1e293b; margin: 0;">Monthly Intelligence Report</h3>
      <p style="color: #64748b; font-size: 14px;">Hi ${userName}, here is a snapshot of your finances for the month.</p>
    </div>

    <div style="display: flex; gap: 20px; justify-content: space-between; margin: 30px 0;">
      <div style="flex: 1; background: #f0fdf4; padding: 20px; border-radius: 16px; text-align: center;">
        <p style="margin: 0; color: #15803d; font-size: 11px; font-weight: 800; text-transform: uppercase;">Total Income</p>
        <p style="margin: 5px 0 0 0; color: #15803d; font-size: 20px; font-weight: 900;">${data.income}</p>
      </div>
      <div style="flex: 1; background: #fef2f2; padding: 20px; border-radius: 16px; text-align: center;">
        <p style="margin: 0; color: #b91c1c; font-size: 11px; font-weight: 800; text-transform: uppercase;">Total Expenses</p>
        <p style="margin: 5px 0 0 0; color: #b91c1c; font-size: 20px; font-weight: 900;">${data.expenses}</p>
      </div>
    </div>

    <div style="background: #f8fafc; padding: 24px; border-radius: 20px; border: 1px solid #e2e8f0; margin: 24px 0;">
      <p style="margin: 0 0 16px 0; font-size: 12px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 1px;">Top Spending Categories</p>
      ${data.topCategories.map(cat => `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 14px;">
          <span style="color: #334155; font-weight: 600;">${cat.name}</span>
          <span style="color: #6366f1; font-weight: 700;">${cat.amount}</span>
        </div>
      `).join('')}
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <p style="font-size: 14px; color: #64748b; line-height: 1.6;">
        Keep tracking and growing! Visit your dashboard for deeper insights.
      </p>
    </div>
  `;
  return getBaseTemplate(content);
};
