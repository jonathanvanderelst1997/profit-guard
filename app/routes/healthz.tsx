export const loader = async () => {
  return Response.json({
    ok: true,
    service: "profit-guard",
    checkedAt: new Date().toISOString(),
  });
};
