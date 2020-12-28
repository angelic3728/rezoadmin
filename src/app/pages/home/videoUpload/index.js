import React, { Component } from 'react';

import Categories from './Categories';
import Cources from './Cources';
import Videos from './Videos';

class VideoUpload extends Component {
    render() {
        return (
            <>
                <div className="row">
                    <div className="col-sm-4 col-md-4 col-lg-4">
                        <Categories />
                    </div>

                    <div className="col-sm-4 col-md-4 col-lg-4">
                        <Cources />
                    </div>

                    <div className="col-sm-4 col-md-4 col-lg-4">
                        <Videos />
                    </div>
                </div>
            </>
        );
    }
}

export default VideoUpload;