/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-6-20
 * Time: 下午3:27
 * To change this template use File | Settings | File Templates.
 */
cc.SIZE_X = 128;
cc.SIZE_Y = 128;

cc.ShaderNode = cc.Node.extend({
    _center:cc.Vertex2(0.0, 0.0),
    _resolution:cc.Vertex2(0.0, 0.0),
    _time:0,
    _uniformCenter:0,
    _uniformResolution:0,
    _uniformTime:0,
    ctor:function () {
        this._center = cc.Vertex2(0.0, 0.0);
        this._resolution = cc.Vertex2(0.0, 0.0);
        this._time = 0;
        this._uniformCenter = 0;
        this._uniformResolution = 0;
        this._uniformTime = 0;
    },

    initWithVertex:function (vert, frag) {
        this.loadShaderVertex(vert, frag);
        this._time = 0;
        this._resolution = cc.Vertex2(cc.SIZE_X, cc.SIZE_Y);
        this.scheduleUpdate();
        this.setContentSize(cc.size(cc.SIZE_X, cc.SIZE_Y));
        this.setAnchorPoint(cc.p(0.5, 0.5));
        return true;
    },

    loadShaderVertex:function (vert, frag) {
        var shader = new cc.GLProgram();
        shader.initWithVertexShaderFilename(vert, frag);

        shader.addAttribute("aVertex", cc.VERTEX_ATTRIB_POSITION);
        shader.link();

        shader.updateUniforms();

        this._uniformCenter = cc.renderContext.getUniformLocation(shader.getProgram(), "center");
        this._uniformResolution = cc.renderContext.getUniformLocation(shader.getProgram(), "resolution");
        this._uniformTime = cc.renderContext.getUniformLocation(shader.getProgram(), "time");

        this.setShaderProgram(shader);

        shader.release();
    },

    update:function (dt) {
        this._time += dt;
    },

    translateFormOtherNode:function (transform) {
        this.setAdditionalTransform(transform);

        this._center = cc.Vertex2(this._additionalTransform.tx * cc.CONTENT_SCALE_FACTOR(), this._additionalTransform.ty * cc.CONTENT_SCALE_FACTOR());
        this._resolution = cc.Vertex2(cc.SIZE_X * this._additionalTransform.a, cc.SIZE_Y * this._additionalTransform.d);
    },

    setPosition:function (newPosition) {
        cc.Node.prototype.setPosition.call(this,newPosition);
        var position = this.getPosition();
        this._center = cc.Vertex2(position.x * cc.CONTENT_SCALE_FACTOR(), position.y * cc.CONTENT_SCALE_FACTOR());
    },

    draw:function () {
        cc.NODE_DRAW_SETUP(this);
        var w = cc.SIZE_X, h = cc.SIZE_Y;
        var vertices = [0, 0, w, 0, w, h, 0, 0, 0, h, w, h];

        // Uniforms
        this.getShaderProgram().setUniformLocationWith2f(this._uniformCenter, this._center.x, this._center.y);
        this.getShaderProgram().setUniformLocationWith2f(this._uniformResolution, this._resolution.x, this._resolution.y);

        // time changes all the time, so it is Ok to call OpenGL directly, and not the "cached" version
        cc.renderContext.uniform1f(this._uniformTime, this._time);
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION);
        cc.renderContext.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, cc.renderContext.FLOAT, false, 0, vertices);
        cc.renderContext.drawArrays(cc.renderContext.TRIANGLES, 0, 6);

        cc.INCREMENT_GL_DRAWS(1);
    }
});
cc.ShaderNode.shaderNodeWithVertex = function (vert, frag) {
    var node = new cc.ShaderNode();
    node.initWithVertex(vert, frag);
    return node;
};