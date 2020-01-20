/* import "App3D.js"
*/
let Primitives = {
    collection : {}
};
Primitive.geomPlane = function (matid, segX, segY) {
	let ap = [],
		au = [],
		ai = [],
		dx = 1/segX,
		dy = 1/segY,
		x0 = -0.5,
		y0 = -0.5,
		xi, yi, ui, vi, pt, uv,
		p1, p2, p3, p4,
		 r, c;
	for (r = 0; r <= segY; r++) {
		yi = dy * r + y0;
		vi = dy * r;
		for (c = 0; c <= segX; c++) {
			xi = dx * c + x0;
			ui = dx * c;
			ap.push(App3D.createPoint(xi, yi, 0));
			au.push(App3D.createUV(1-ui, vi));
		}
	}
	for (r = 0; r < segY; r++) {
		for (c = 0; c < segX; c++) {
			p1 = r * (segX+1) + c;
			p2 = p1 + 1;
			p3 = (r + 1) * (segX+1) + c;
			p4 = p3 + 1
			ai.push(App3D.createIndice(matid, p1, p2, p4));
			ai.push(App3D.createIndice(matid, p1, p4, p3));
		}
	}
	return {
		points : ap,
		uvs : au,
		indice : ai
	};
};
Primitive.createBox = function (lx, ly, lz, segX, segY, segZ, images) {
	let front = geomPlane(0, segX, segY);
	let back = geomPlane(1, segX, segY);
	let left = geomPlane(2, segZ, segY);
	let right = geomPlane(3, segZ, segY);
	let top = geomPlane(4, segX, segZ);
	let bottom = geomPlane(5, segX, segZ);
	
	let P2 = Math.PI / 2;

	App3D.translatePoints(front.points, 0, 0, -0.5);
   
	App3D.rotatePointsY(back.points, Math.PI);
	App3D.translatePoints(back.points, 0, 0, 0.5);
   
	App3D.rotatePointsY(left.points, P2);
	App3D.translatePoints(left.points, -0.5, 0, 0);
	
	App3D.rotatePointsY(right.points, -P2);
	App3D.translatePoints(right.points, 0.5, 0, 0);
	
	App3D.rotatePointsX(bottom.points, P2);
	App3D.translatePoints(bottom.points, 0, 0.5, 0);
	
	App3D.rotatePointsX(top.points, -P2);
	App3D.translatePoints(top.points, 0, -0.5, 0);

	let am = [],
		ap = [],
		au = [],
		ai = [];
	let addGeom = (o, im) => {
		App3D.scalePoints(o.uvs, im.width, im.height);
		let ipt = ap.length;
		am.push(new TextureMaterial(im));
		while (o.points.length > 0) {
			au.push(o.uvs.shift());
			p = o.points.shift();
			p[0] *= lx;
			p[1] *= ly;
			p[2] *= lz;
			ap.push(p);
		}
		while (o.indice.length > 0) {
			let t = o.indice.shift();
			t[1] += ipt,
			t[2] += ipt,
			t[3] += ipt
			ai.push(t);
			t.length = 0;
		}
	};
	addGeom(front,  images[0]);
	addGeom(back,   images[1]);
	addGeom(left,   images[2]);
	addGeom(right,  images[3]);
	addGeom(top,    images[4]);
	addGeom(bottom, images[5]);

	let model = new Model(am, ap, au, ai);
	
	return model;
};

Primitive.geomCylinder = function (
	 radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength ) {

	BufferGeometry.call( this );

	this.parameters = {
		radiusTop: radiusTop,
		radiusBottom: radiusBottom,
		height: height,
		radialSegments: radialSegments,
		heightSegments: heightSegments,
		openEnded: openEnded,
		thetaStart: thetaStart,
		thetaLength: thetaLength
	};

	let scope = this;

	radiusTop = radiusTop !== undefined ? radiusTop : 1;
	radiusBottom = radiusBottom !== undefined ? radiusBottom : 1;
	height = height || 1;

	radialSegments = Math.floor( radialSegments ) || 8;
	heightSegments = Math.floor( heightSegments ) || 1;

	openEnded = openEnded !== undefined ? openEnded : false;
	thetaStart = thetaStart !== undefined ? thetaStart : 0.0;
	thetaLength = thetaLength !== undefined ? thetaLength : Math.PI * 2;

	// buffers
	let indices = [];
	let vertices = [];
	let normals = [];
	let uvs = [];

	// helper letiables
	let index = 0;
	let indexArray = [];
	let halfHeight = height / 2;
	let groupStart = 0;

	generateTorso();

	if ( openEnded === false ) {
		if ( radiusTop > 0 ) generateCap( true );
		if ( radiusBottom > 0 ) generateCap( false );
	}

	this.setIndex( indices );
	this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
	this.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );
	this.setAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );
    
	function generateTorso() {
		let x, y;
		let normal = new Vector3();
		let vertex = new Vector3();
		let groupCount = 0;
		let slope = ( radiusBottom - radiusTop ) / height;
		for ( y = 0; y <= heightSegments; y ++ ) {
			let indexRow = [];
			let v = y / heightSegments;
			let radius = v * ( radiusBottom - radiusTop ) + radiusTop;
			for ( x = 0; x <= radialSegments; x ++ ) {
				let u = x / radialSegments;
				let theta = u * thetaLength + thetaStart;
				let sinTheta = Math.sin( theta );
				let cosTheta = Math.cos( theta );
				// vertex
				vertex.x = radius * sinTheta;
				vertex.y = - v * height + halfHeight;
				vertex.z = radius * cosTheta;
				vertices.push( vertex.x, vertex.y, vertex.z );
				// normal
				normal.set( sinTheta, slope, cosTheta ).normalize();
				normals.push( normal.x, normal.y, normal.z );
				uvs.push( u, 1 - v );
				indexRow.push( index ++ );
			}
			indexArray.push( indexRow );
		}
		for ( x = 0; x < radialSegments; x ++ ) {
			for ( y = 0; y < heightSegments; y ++ ) {
				let a = indexArray[ y ][ x ];
				let b = indexArray[ y + 1 ][ x ];
				let c = indexArray[ y + 1 ][ x + 1 ];
				let d = indexArray[ y ][ x + 1 ];
				indices.push( a, b, d );
				indices.push( b, c, d );
				groupCount += 6;
			}
		}
		scope.addGroup( groupStart, groupCount, 0 );
		groupStart += groupCount;
	}

	function generateCap( top ) {
		let x, centerIndexStart, centerIndexEnd;
		let uv = new Vector2();
		let vertex = new Vector3();
		let groupCount = 0;
		let radius = ( top === true ) ? radiusTop : radiusBottom;
		let sign = ( top === true ) ? 1 : - 1;
		centerIndexStart = index;
		for ( x = 1; x <= radialSegments; x ++ ) {
			vertices.push( 0, halfHeight * sign, 0 );
			normals.push( 0, sign, 0 );
			uvs.push( 0.5, 0.5 );
			index ++;
		}
		centerIndexEnd = index;
		for ( x = 0; x <= radialSegments; x ++ ) {
			let u = x / radialSegments;
			let theta = u * thetaLength + thetaStart;
			let cosTheta = Math.cos( theta );
			let sinTheta = Math.sin( theta );
			vertex.x = radius * sinTheta;
			vertex.y = halfHeight * sign;
			vertex.z = radius * cosTheta;
			vertices.push( vertex.x, vertex.y, vertex.z );
			normals.push( 0, sign, 0 );
			uv.x = ( cosTheta * 0.5 ) + 0.5;
			uv.y = ( sinTheta * 0.5 * sign ) + 0.5;
			uvs.push( uv.x, uv.y );
			index ++;
		}
		for ( x = 0; x < radialSegments; x ++ ) {
			let c = centerIndexStart + x;
			let i = centerIndexEnd + x;
			if ( top === true ) {
				indices.push( i, i + 1, c );
			} else {
				indices.push( i + 1, i, c );
			}
			groupCount += 3;
		}
		scope.addGroup( groupStart, groupCount, top === true ? 1 : 2 );
		groupStart += groupCount;
	}
}
