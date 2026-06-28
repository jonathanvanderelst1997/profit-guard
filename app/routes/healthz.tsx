export const loader = async () => {
  return Response.json({
    ok: true,
    service: "profit-guard",
    commit: process.env.RENDER_GIT_COMMIT ?? null,
    checkedAt: new Date().toISOString(),
  });
};
