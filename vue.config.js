module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? "/chs.scheduling.client/" : "/",
  transpileDependencies: ["vuetify"],
};
