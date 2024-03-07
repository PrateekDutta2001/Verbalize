import React from 'react';

import {
    Navbar,
    NavbarBrand
} from 'reactstrap';

import logo from '../assets/site.PNG';


const Header = () => {
    return (
        <Navbar color='dark' dark={true} expand="lg" container='fluid'>
            <NavbarBrand>
                <img
                    className='App-logo'
                    alt="logo"
                    src={logo}
                    style={{
                        height: 40,
                        width: 40,
                        marginRight: 5
                    }}
                />
                Verbalize
            </NavbarBrand>
        </Navbar>
    )
}

export default Header;