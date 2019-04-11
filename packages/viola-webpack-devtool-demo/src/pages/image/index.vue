<template>
  <scroller style="padding: 10dp;">
    <div style="margin-bottom: 15dp;">
      <text style="font-size: 16dp; color: grey;" value="png:" />
      <image
        style="
          width: 150dp;
          height: 150dp;
        "
        resize="cover"
        src="http://10.65.94.203:8017/image_png_test.png" />
    </div>

    <div @click="onclick">
      <text style="font-size: 16dp; color: grey;" value="png (图片样式中带有 backgroundColor: black):" />
      <image
        style="
          width: 150dp;
          height: 150dp;
          backgroundColor: black;
        "
        resize="cover"
        src="https://img1.gtimg.com/ninja/2/2019/04/ninja155485814963506.jpg" />
    </div>

    <div>
      <text style="font-size: 16dp; color: red;" value="png" />
      <image
        style="
          width: 50dp;
          height: 50dp;
        "
        resize="cover"
        src="http://10.65.94.203:8017/search_png.png" />
    </div>

    <div>
      <text style="font-size: 16dp; color: grey;" value="png (图片样式中带有 backgroundColor: black):" />
      <image
        style="
          width: 50dp;
          height: 50dp;
          backgroundColor: black;
        "
        resize="cover"
        src="http://10.65.94.203:8017/search_png.png" />
    </div>
  </scroller>
</template>

<script>
export default {
  methods: {
    onclick () {
      console.log('????')
    }
  }
}
</script>

<style>

</style>
